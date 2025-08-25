# BugCamp Lab Management Makefile
# Uses labs.json as source of truth for lab information

# Default target
.DEFAULT_GOAL := help

# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
BLUE := \033[0;34m
NC := \033[0m

# Check if jq is installed
JQ := $(shell command -v jq 2> /dev/null)

# Get level names from labs.json
LEVELS := $(shell if [ -n "$(JQ)" ]; then jq -r '.levels[].name' labs.json 2>/dev/null; fi)

# Get all lab names from all levels
ALL_LABS := $(shell if [ -n "$(JQ)" ]; then jq -r '.levels[].labs[].name' labs.json 2>/dev/null; fi)

# Network name for labs
NETWORK_NAME := labnet

# Attacker server container name
ATTACKER_CONTAINER := attacker-server

.PHONY: help list status clean $(LEVELS) $(ALL_LABS)

# Help target
help: ## Display available commands and usage information
	@echo -e "$(BLUE)Available commands:$(NC)"
	@echo ""
	@echo -e "$(GREEN)Lab Management:$(NC)"
	@echo "  make list          List all available levels"
	@echo "  make level-01-list List labs within level-01"
	@echo "  make <lab-name>    Build and run the specified lab with attacker-server"
	@echo "  make status        Show status of currently running containers"
	@echo "  make clean         Stop and remove all lab containers and attacker-server"
	@echo ""
	@echo -e "$(GREEN)Available levels:$(NC)"
	@if [ -n "$(LEVELS)" ]; then \
		for level in $(LEVELS); do \
			echo "  $$level"; \
		done; \
	else \
		echo "  No levels found in labs.json"; \
	fi
	@echo ""
	@echo -e "$(GREEN)Examples:$(NC)"
	@echo "  make list          List all levels"
	@echo "  make level-01-list List labs in level-01"
	@echo "  make jwt-i         Run the JWT lab"
	@echo "  make cve-2014-6271 Run the Shellshock lab"

# List all available levels
list: ## List all available levels from labs.json
	@echo -e "$(BLUE)Available Levels:$(NC)"
	@echo ""
	@if [ -n "$(JQ)" ]; then \
		jq -r '.levels[] | "\(.name):\n  Description: \(.description)\n  Labs: \(.labs | length)\n"' labs.json 2>/dev/null; \
	else \
		echo -e "$(RED)Error: jq is not installed. Please install jq to parse labs.json$(NC)"; \
		exit 1; \
	fi

# Dynamic level targets for listing labs within a level
$(LEVELS): ## List labs within a specific level
	@echo -e "$(BLUE)Labs in $@:$(NC)"
	@echo ""
	@if [ -n "$(JQ)" ]; then \
		jq -r '.levels[] | select(.name == "$@") | .labs[] | "\(.name):\n  Vulnerability: \(.vulnerability)\n  Description: \(.description)\n  Port: \(.port)\n  Objective: \(.objective)\n  Category: \(.category)\n"' labs.json 2>/dev/null; \
	else \
		echo -e "$(RED)Error: jq is not installed. Please install jq to parse labs.json$(NC)"; \
		exit 1; \
	fi

# Status target
status: ## Show status of currently running lab and attacker-server containers
	@echo -e "$(BLUE)Container Status:$(NC)"
	@echo ""
	@echo -e "$(GREEN)Lab Containers:$(NC)"
	@if [ -n "$(ALL_LABS)" ]; then \
		for lab in $(ALL_LABS); do \
			if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "$$lab-lab"; then \
				docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "$$lab-lab"; \
			else \
				echo -e "$(YELLOW)$$lab-lab: Not running$(NC)"; \
			fi; \
		done; \
	fi
	@echo ""
	@echo -e "$(GREEN)Attacker Server:$(NC)"
	@if docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -q "$(ATTACKER_CONTAINER)"; then \
		docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep "$(ATTACKER_CONTAINER)"; \
	else \
		echo -e "$(YELLOW)$(ATTACKER_CONTAINER): Not running$(NC)"; \
	fi
	@echo ""
	@echo -e "$(GREEN)Network:$(NC)"
	@if docker network ls | grep -q "$(NETWORK_NAME)"; then \
		echo -e "$(GREEN)$(NETWORK_NAME) network exists$(NC)"; \
	else \
		echo -e "$(YELLOW)$(NETWORK_NAME) network does not exist$(NC)"; \
	fi

# Clean target
clean: ## Stop and remove all lab containers and the attacker-server container
	@echo -e "$(YELLOW)Cleaning up containers...$(NC)"
	@if [ -n "$(ALL_LABS)" ]; then \
		for lab in $(ALL_LABS); do \
			if docker ps -q -f name="$$lab-lab" | grep -q .; then \
				echo "Stopping $$lab-lab..."; \
				docker stop $$lab-lab 2>/dev/null || true; \
				echo "Removing $$lab-lab..."; \
				docker rm $$lab-lab 2>/dev/null || true; \
			fi; \
		done; \
	fi
	@if docker ps -q -f name="$(ATTACKER_CONTAINER)" | grep -q .; then \
		echo "Stopping $(ATTACKER_CONTAINER)..."; \
		docker stop $(ATTACKER_CONTAINER) 2>/dev/null || true; \
		echo "Removing $(ATTACKER_CONTAINER)..."; \
		docker rm $(ATTACKER_CONTAINER) 2>/dev/null || true; \
	fi
	@echo -e "$(GREEN)Cleanup complete!$(NC)"

# Dynamic lab targets
$(ALL_LABS): ## Build and run the specified lab
	@echo -e "$(BLUE)Starting lab: $@$(NC)"
	@echo ""
	
	# Check if labs.json exists and jq is available
	@if [ ! -f "labs.json" ]; then \
		echo -e "$(RED)Error: labs.json not found$(NC)"; \
		exit 1; \
	fi
	@if [ -z "$(JQ)" ]; then \
		echo -e "$(RED)Error: jq is not installed. Please install jq to parse labs.json$(NC)"; \
		exit 1; \
	fi
	
	# Validate lab exists in labs.json
	@if ! jq -e '.levels[].labs[] | select(.name == "$@")' labs.json > /dev/null 2>&1; then \
		echo -e "$(RED)Error: Lab '$@' not found in labs.json$(NC)"; \
		exit 1; \
	fi
	
	# Check if lab directory exists (search in all levels)
	@if [ ! -d "labs/level-01/$@" ] && [ ! -d "labs/level-00/$@" ]; then \
		echo -e "$(RED)Error: Lab directory not found in labs/level-01/ or labs/level-00/$(NC)"; \
		exit 1; \
	fi
	
	# Stop and remove any previously running lab containers
	@echo -e "$(YELLOW)Stopping any previously running lab containers...$(NC)"
	@if [ -n "$(ALL_LABS)" ]; then \
		for lab in $(ALL_LABS); do \
			if docker ps -q -f name="$$lab-lab" | grep -q .; then \
				docker stop $$lab-lab 2>/dev/null || true; \
				docker rm $$lab-lab 2>/dev/null || true; \
			fi; \
		done; \
	fi
	
	# Stop and remove attacker-server if running
	@if docker ps -q -f name="$(ATTACKER_CONTAINER)" | grep -q .; then \
		echo "Stopping $(ATTACKER_CONTAINER)..."; \
		docker stop $(ATTACKER_CONTAINER) 2>/dev/null || true; \
		docker rm $(ATTACKER_CONTAINER) 2>/dev/null || true; \
	fi
	
	# Create labnet network if it doesn't exist
	@echo -e "$(YELLOW)Ensuring labnet network exists...$(NC)"
	@docker network create $(NETWORK_NAME) 2>/dev/null || true
	
	# Get lab port from labs.json
	$(eval LAB_PORT := $(shell jq -r '.levels[].labs[] | select(.name == "$@") | .port' labs.json))
	$(eval LAB_VULNERABILITY := $(shell jq -r '.levels[].labs[] | select(.name == "$@") | .vulnerability' labs.json))
	$(eval LAB_OBJECTIVE := $(shell jq -r '.levels[].labs[] | select(.name == "$@") | .objective' labs.json))
	
	@echo -e "$(GREEN)Lab: $@$(NC)"
	@echo -e "$(GREEN)Vulnerability: $(LAB_VULNERABILITY)$(NC)"
	@echo -e "$(GREEN)Objective: $(LAB_OBJECTIVE)$(NC)"
	@echo -e "$(GREEN)Port: $(LAB_PORT)$(NC)"
	@echo ""
	
	# Build and run the lab (try level-01 first, then level-00)
	@echo -e "$(YELLOW)Building and starting lab container...$(NC)"
	@if [ -d "labs/level-01/$@" ]; then \
		cd labs/level-01/$@ && docker-compose up -d --build; \
	elif [ -d "labs/level-00/$@" ]; then \
		cd labs/level-00/$@ && docker-compose up -d --build; \
	else \
		echo -e "$(RED)Error: Could not find lab directory$(NC)"; \
		exit 1; \
	fi
	
	# Build and run attacker-server
	@echo -e "$(YELLOW)Building and starting attacker-server...$(NC)"
	@cd attacker-server && docker build -t $(ATTACKER_CONTAINER) .
	@docker run -d --name $(ATTACKER_CONTAINER) --network $(NETWORK_NAME) -p 8085:8080 $(ATTACKER_CONTAINER)
	
	@echo ""
	@echo -e "$(GREEN)Lab '$@' is now running!$(NC)"
	@echo -e "$(GREEN)Lab accessible at: http://localhost:$(LAB_PORT)$(NC)"
	@echo -e "$(GREEN)Attacker server accessible at: http://localhost:8085$(NC)"
	@echo -e "$(GREEN)Both containers are running on the '$(NETWORK_NAME)' network$(NC)"
	@echo ""
	@echo -e "$(BLUE)Use 'make status' to check container status$(NC)"
	@echo -e "$(BLUE)Use 'make clean' to stop all containers$(NC)"
