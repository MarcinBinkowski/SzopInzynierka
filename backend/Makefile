.PHONY: build up down

RELAY_PORT := 5055
RELAY_HOST := 0.0.0.0
RELAY_PID  := .relay.pid

build:
	@docker compose build

up:
	@echo "Checking Python environment..."
	@python3 -c "import flask; print('✅ Flask available')" 2>/dev/null || { \
		echo "❌ Flask not available. Please activate virtual environment:"; \
		exit 1; \
	}
	@echo "Checking if port $(RELAY_PORT) is free..."
	@lsof -i :$(RELAY_PORT) >/dev/null 2>&1 && { \
		echo "❌ Port $(RELAY_PORT) is already in use. Please free up the port:"; \
		echo "  kill -9 \$\(lsof -ti:5055\)"; \
		exit 1; \
	} || echo "✅ Port $(RELAY_PORT) is free"
	@nohup env HOST=$(RELAY_HOST) PORT=$(RELAY_PORT) python3 notify.py > /dev/null 2>&1 &
	@echo "✅ Notification service started (PID: $$!)"
	@docker compose up

down:
	@docker compose down
	@lsof -ti:5055 | xargs -r kill -9

