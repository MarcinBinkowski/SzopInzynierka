.PHONY: up down

RELAY_PORT := 5055
RELAY_HOST := 0.0.0.0
RELAY_PID  := .relay.pid

up:
	@nohup env HOST=$(RELAY_HOST) PORT=$(RELAY_PORT) python3 notify.py >/dev/null 2>&1 & echo $$! > $(RELAY_PID)
	@docker compose up

down:
	@docker compose down
	@if [ -f $(RELAY_PID) ] && kill -0 $$(cat $(RELAY_PID)) 2>/dev/null; then kill $$(cat $(RELAY_PID)) || true; fi
	@rm -f $(RELAY_PID)

