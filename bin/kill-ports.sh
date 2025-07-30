#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Buscando procesos en los puertos de las aplicaciones...${NC}\n"

# Ports used by each service
declare -A ports=(
    ["Backend_API"]=3000
    ["Astro_Web"]=4321
    ["React_Dashboard"]=5173
)

# Function to kill process on a specific port
kill_port() {
    local name=$1
    local port=$2
    
    echo -e "${YELLOW}Verificando puerto $port ($name)...${NC}"
    
    # Find process using the port
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo -e "${RED}❌ Proceso encontrado en puerto $port (PID: $pid)${NC}"
        kill -9 $pid 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Proceso eliminado exitosamente${NC}"
        else
            echo -e "${RED}❌ Error al eliminar el proceso${NC}"
        fi
    else
        echo -e "${GREEN}✅ Puerto $port está libre${NC}"
    fi
    
    echo ""
}

# Kill processes on all ports
for service in "${!ports[@]}"; do
    # Replace underscores with spaces for display
    display_name="${service//_/ }"
    kill_port "$display_name" "${ports[$service]}"
done

echo -e "${GREEN}✨ Limpieza de puertos completada${NC}\n"

# Optional: Show current status of ports
echo -e "${YELLOW}Estado actual de los puertos:${NC}"
for service in "${!ports[@]}"; do
    port="${ports[$service]}"
    display_name="${service//_/ }"
    if lsof -ti:$port >/dev/null 2>&1; then
        echo -e "${RED}❌ Puerto $port ($display_name) - EN USO${NC}"
    else
        echo -e "${GREEN}✅ Puerto $port ($display_name) - LIBRE${NC}"
    fi
done