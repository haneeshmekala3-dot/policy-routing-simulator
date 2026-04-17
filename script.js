document.addEventListener('DOMContentLoaded', () => {
    // --- Topologies Data ---
    const topologies = {
        default: {
            name: "Default Architecture",
            nodes: {
                'PC1': { type: 'pc', label: 'Source 1', ip: '10.0.0.1', icon: '💻', left: '15%', top: '25%', color: 'var(--accent-green)' },
                'PC2': { type: 'pc', label: 'Source 2', ip: '10.0.0.2', icon: '💻', left: '15%', top: '75%', color: 'var(--accent-green)' },
                'RC':  { type: 'core', label: 'Core Router', ip: 'PBR Core', icon: '🔄', left: '40%', top: '50%', color: 'var(--accent-purple)' },
                'ISP1':{ type: 'isp', label: 'ISP 1 Router', ip: 'Path 1', icon: '🌐', left: '65%', top: '25%', color: 'var(--accent-blue)' },
                'ISP2':{ type: 'isp', label: 'ISP 2 Router', ip: 'Default', icon: '🌐', left: '65%', top: '75%', color: 'var(--accent-blue)' },
                'SVR': { type: 'server', label: 'Destination', ip: '8.8.8.8', icon: '🗄️', left: '90%', top: '50%', color: 'var(--accent-pink)' }
            },
            links: [
                ['PC1', 'RC'],
                ['PC2', 'RC'],
                ['RC', 'ISP1'],
                ['RC', 'ISP2'],
                ['ISP1', 'SVR'],
                ['ISP2', 'SVR']
            ],
            routing: { // node => destIp => nextHop  (fallback to 'default')
                'PC1': { default: 'RC' },
                'PC2': { default: 'RC' },
                'RC': { '8.8.8.8': 'ISP2', '10.0.0.1': 'PC1', '10.0.0.2': 'PC2', default: 'ISP2' },
                'ISP1': { '8.8.8.8': 'SVR', '10.0.0.1': 'RC', '10.0.0.2': 'RC', default: 'RC' },
                'ISP2': { '8.8.8.8': 'SVR', '10.0.0.1': 'RC', '10.0.0.2': 'RC', default: 'RC' },
                'SVR': { default: 'ISP2' }
            }
        },
        complex: {
            name: "Complex Enterprise",
            nodes: {
                'PC1': { type: 'pc', label: 'Subnet A', ip: '192.168.1.10', icon: '💻', left: '10%', top: '30%', color: 'var(--accent-green)' },
                'PC2': { type: 'pc', label: 'Subnet B', ip: '192.168.2.10', icon: '💻', left: '10%', top: '70%', color: 'var(--accent-green)' },
                'SW1': { type: 'core', label: 'Dist Switch', ip: 'VLAN Route', icon: '🔀', left: '30%', top: '50%', color: '#f59e0b' },
                'R1':  { type: 'core', label: 'Edge R1', ip: 'Primary', icon: '🔄', left: '55%', top: '25%', color: 'var(--accent-purple)' },
                'R2':  { type: 'core', label: 'Edge R2', ip: 'Backup', icon: '🔄', left: '55%', top: '75%', color: 'var(--accent-purple)' },
                'ISP': { type: 'isp', label: 'ISP Backbone', ip: 'Internet', icon: '🌐', left: '75%', top: '50%', color: 'var(--accent-blue)' },
                'SVR1':{ type: 'server', label: 'Web Server', ip: '1.1.1.1', icon: '🗄️', left: '95%', top: '30%', color: 'var(--accent-pink)' },
                'SVR2':{ type: 'server', label: 'DB Server', ip: '8.8.4.4', icon: '🗄️', left: '95%', top: '70%', color: 'var(--accent-pink)' }
            },
            links: [
                ['PC1', 'SW1'],
                ['PC2', 'SW1'],
                ['SW1', 'R1'],
                ['SW1', 'R2'],
                ['R1', 'ISP'],
                ['R2', 'ISP'],
                ['ISP', 'SVR1'],
                ['ISP', 'SVR2']
            ],
            routing: {
                'PC1': { default: 'SW1' },
                'PC2': { default: 'SW1' },
                'SW1': { '1.1.1.1': 'R1', '8.8.4.4': 'R2', '192.168.1.10': 'PC1', '192.168.2.10': 'PC2', default: 'R1' },
                'R1': { '1.1.1.1': 'ISP', '8.8.4.4': 'ISP', '192.168.1.10': 'SW1', '192.168.2.10': 'SW1', default: 'ISP' },
                'R2': { '1.1.1.1': 'ISP', '8.8.4.4': 'ISP', '192.168.1.10': 'SW1', '192.168.2.10': 'SW1', default: 'ISP' },
                'ISP': { '1.1.1.1': 'SVR1', '8.8.4.4': 'SVR2', default: 'R1' },
                'SVR1': { default: 'ISP' },
                'SVR2': { default: 'ISP' }
            }
        },
        custom: {
            name: "Custom Setup...",
            nodes: {},
            links: [],
            routing: {}
        }
    };

    // --- State ---
    let currentTopologyId = 'default';
    let pbrRules = []; // Array of { routerId, sourceIp, nextHop }
    let isSimulating = false;

    // --- DOM Elements ---
    const topologySelect = document.getElementById('topology-select');
    const nodesContainer = document.getElementById('nodes-container');
    const networkLinks = document.getElementById('network-links');
    
    const ruleRouterSelect = document.getElementById('rule-router');
    const ruleSourceSelect = document.getElementById('rule-source');
    const ruleNexthopSelect = document.getElementById('rule-nexthop');
    const btnAddRule = document.getElementById('btn-add-rule');
    const rulesBody = document.getElementById('rules-body');
    const noRulesRow = document.getElementById('no-rules-row');
    
    // Custom Setup UI
    const customGenUi = document.getElementById('custom-gen-ui');
    const customSrc = document.getElementById('custom-src');
    const customDst = document.getElementById('custom-dst');
    const btnGenerateTopology = document.getElementById('btn-generate-topology');
    
    const simSourceSelect = document.getElementById('sim-source');
    const simDestSelect = document.getElementById('sim-dest');
    const btnSendPacket = document.getElementById('btn-send-packet');
    const simLog = document.getElementById('sim-log');
    
    const packet = document.getElementById('packet');

    // --- Functions ---
    
    function initTopologySelect() {
        topologySelect.innerHTML = '';
        for (const [key, t] of Object.entries(topologies)) {
            const opt = document.createElement('option');
            opt.value = key;
            opt.textContent = t.name;
            topologySelect.appendChild(opt);
        }
        topologySelect.addEventListener('change', (e) => {
            currentTopologyId = e.target.value;
            pbrRules = []; // Reset rules on topology change
            if (currentTopologyId === 'custom') {
                customGenUi.style.display = 'flex';
                generateCustomTopology();
            } else {
                customGenUi.style.display = 'none';
                renderTopology();
                renderRules();
                clearLog();
            }
        });
        
        btnGenerateTopology.addEventListener('click', () => {
             generateCustomTopology();
        });
    }

    function generateCustomTopology() {
        const numSrc = Math.min(6, Math.max(1, parseInt(customSrc.value) || 1));
        const numDst = Math.min(6, Math.max(1, parseInt(customDst.value) || 1));
        
        let customNodes = {};
        let customLinks = [];
        let customRouting = {};

        // Ingress and Egress Switches
        customNodes['SW-IN'] = { type: 'core', label: 'Ingress SW', ip: 'VLAN 10', icon: '🔀', left: '30%', top: '50%', color: '#f59e0b' };
        customNodes['SW-OUT'] = { type: 'core', label: 'Egress SW', ip: 'VLAN 20', icon: '🔀', left: '70%', top: '50%', color: '#f59e0b' };
        customRouting['SW-IN'] = { default: 'R1' };
        customRouting['SW-OUT'] = { default: 'R1' };
        
        // Generate Routers (2 to 4)
        const numRouters = Math.min(4, Math.max(2, Math.floor((numSrc + numDst) / 2)));
        const rSpan = 60; // 20% to 80%
        for(let i=1; i<=numRouters; i++) {
            const rId = 'R' + i;
            const yPos = numRouters > 1 ? 20 + ((i-1) * (rSpan / (numRouters - 1))) : 50;
            customNodes[rId] = { type: 'isp', label: `Core R${i}`, ip: `Path ${i}`, icon: '🔄', left: '50%', top: `${yPos}%`, color: 'var(--accent-purple)' };
            customLinks.push(['SW-IN', rId]);
            customLinks.push([rId, 'SW-OUT']);
            customRouting[rId] = { default: 'SW-OUT' };
        }
        
        // Generate Sources
        const srcSpan = 74; // 13% to 87%
        for(let i=1; i<=numSrc; i++) {
            const sId = 'SRC' + i;
            const sIp = `10.0.${i}.1`;
            const yPos = numSrc > 1 ? 13 + ((i-1) * (srcSpan / (numSrc - 1))) : 50;
            customNodes[sId] = { type: 'pc', label: `Source ${i}`, ip: sIp, icon: '💻', left: '10%', top: `${yPos}%`, color: 'var(--accent-green)' };
            customLinks.push([sId, 'SW-IN']);
            customRouting[sId] = { default: 'SW-IN' };
            customRouting['SW-IN'][sIp] = sId;
            for(let r=1; r<=numRouters; r++) customRouting['R'+r][sIp] = 'SW-IN';
            customRouting['SW-OUT'][sIp] = 'R1'; // backwards
        }
        
        // Generate Destinations
        const dstSpan = 74;
        for(let i=1; i<=numDst; i++) {
            const dId = 'DST' + i;
            const dIp = `8.8.${i}.8`;
            const yPos = numDst > 1 ? 13 + ((i-1) * (dstSpan / (numDst - 1))) : 50;
            customNodes[dId] = { type: 'server', label: `Dest ${i}`, ip: dIp, icon: '🗄️', left: '90%', top: `${yPos}%`, color: 'var(--accent-pink)' };
            customLinks.push(['SW-OUT', dId]);
            customRouting[dId] = { default: 'SW-OUT' };
            customRouting['SW-OUT'][dIp] = dId;
            for(let r=1; r<=numRouters; r++) customRouting['R'+r][dIp] = 'SW-OUT';
            customRouting['SW-IN'][dIp] = 'R1'; // default forwards via R1
        }

        topologies['custom'] = {
            name: "Custom Setup...",
            nodes: customNodes,
            links: customLinks,
            routing: customRouting
        };
        
        pbrRules = [];
        renderTopology();
        renderRules();
        clearLog();
    }

    function renderTopology() {
        const top = topologies[currentTopologyId];
        
        // 1. Render Nodes
        nodesContainer.innerHTML = '';
        const ipOptions = [];
        const nodeOptions = [];
        
        for (const [id, node] of Object.entries(top.nodes)) {
            const div = document.createElement('div');
            div.className = `node ${node.type}`;
            div.id = `node-${id}`;
            div.style.left = node.left;
            div.style.top = node.top;
            
            div.innerHTML = `
                <div class="node-icon" style="border-color: ${node.color}">${node.icon}</div>
                <div class="node-label">${node.label}<br><small>${node.ip}</small></div>
            `;
            nodesContainer.appendChild(div);
            
            // Populate Dropdowns info
            if (node.ip.match(/\d+\.\d+\.\d+\.\d+/)) {
                ipOptions.push({value: node.ip, text: `${node.ip} (${node.label})`});
            }
            nodeOptions.push({value: id, text: `${id} (${node.label})`});
        }
        
        // 2. Render Links
        networkLinks.innerHTML = '';
        top.links.forEach(link => {
            const n1 = top.nodes[link[0]];
            const n2 = top.nodes[link[1]];
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'link');
            line.setAttribute('id', `link-${link[0]}-${link[1]}`);
            line.setAttribute('x1', n1.left);
            line.setAttribute('y1', n1.top);
            line.setAttribute('x2', n2.left);
            line.setAttribute('y2', n2.top);
            networkLinks.appendChild(line);
        });
        
        // 3. Populate Selects
        populateSelect(simSourceSelect, ipOptions);
        populateSelect(simDestSelect, ipOptions);
        populateSelect(ruleSourceSelect, ipOptions);
        populateSelect(ruleRouterSelect, nodeOptions.filter(n => top.nodes[n.value].type === 'core' || top.nodes[n.value].type === 'isp'));
        populateSelect(ruleNexthopSelect, nodeOptions);
    }
    
    function populateSelect(element, options) {
        element.innerHTML = '';
        options.forEach(o => {
            const opt = document.createElement('option');
            opt.value = o.value;
            opt.textContent = o.text;
            element.appendChild(opt);
        });
    }

    function log(message, type = 'info') {
        const p = document.createElement('p');
        p.className = `log-${type}`;
        p.textContent = `> ${message}`;
        simLog.appendChild(p);
        simLog.scrollTop = simLog.scrollHeight;
        
        const placeholder = simLog.querySelector('.placeholder');
        if (placeholder) placeholder.remove();
    }

    function clearLog() {
        simLog.innerHTML = '<p class="placeholder">Awaiting transmission...</p>';
    }

    function renderRules() {
        if (pbrRules.length === 0) {
            rulesBody.innerHTML = '';
            if(!rulesBody.contains(noRulesRow)) rulesBody.appendChild(noRulesRow);
            return;
        }

        rulesBody.innerHTML = '';
        pbrRules.forEach((rule, index) => {
            const tr = document.createElement('tr');
            
            const tdRouter = document.createElement('td');
            tdRouter.textContent = rule.routerId;
            
            const tdSource = document.createElement('td');
            tdSource.textContent = rule.sourceIp;
            
            const tdHop = document.createElement('td');
            tdHop.textContent = rule.nextHop;
            
            const tdAction = document.createElement('td');
            const btnDelete = document.createElement('button');
            btnDelete.className = 'btn-delete';
            btnDelete.textContent = 'Remove';
            btnDelete.onclick = () => {
                pbrRules.splice(index, 1);
                renderRules();
                log(`Removed policy rule for ${rule.sourceIp} on ${rule.routerId}`, 'warning');
            };
            tdAction.appendChild(btnDelete);
            
            tr.appendChild(tdRouter);
            tr.appendChild(tdSource);
            tr.appendChild(tdHop);
            tr.appendChild(tdAction);
            rulesBody.appendChild(tr);
        });
    }

    function setPacketPosition(nodeId) {
        const top = topologies[currentTopologyId];
        const node = top.nodes[nodeId];
        if(!node) return;
        packet.style.left = node.left;
        packet.style.top = node.top;
        if(node.color && !packet.classList.contains('error-state')) {
            packet.style.backgroundColor = node.color;
            packet.style.boxShadow = `0 0 15px ${node.color}`;
        }
    }

    function setPacketError() {
        packet.classList.add('error-state');
        packet.style.backgroundColor = 'var(--danger)';
        packet.style.boxShadow = `0 0 20px var(--danger)`;
    }
    
    function resetPacketState() {
        packet.classList.remove('error-state');
    }

    function highlightLink(fromId, toId, duration, isFailed = false) {
        const id1 = `link-${fromId}-${toId}`;
        const id2 = `link-${toId}-${fromId}`;
        
        const link = document.getElementById(id1) || document.getElementById(id2);
        if (link) {
            link.classList.add('active');
            if (isFailed) {
                link.style.stroke = 'var(--danger)';
            }
            setTimeout(() => {
                link.classList.remove('active');
                link.style.stroke = ''; // Reset to default
            }, duration);
        }
    }

    function wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    function getNodeIdByIp(ip) {
        const top = topologies[currentTopologyId];
        for (const [id, node] of Object.entries(top.nodes)) {
            if (node.ip === ip) return id;
        }
        return null;
    }
    
    function areAdjacents(id1, id2) {
        const top = topologies[currentTopologyId];
        for (let l of top.links) {
            if ((l[0]===id1 && l[1]===id2) || (l[0]===id2 && l[1]===id1)) return true;
        }
        return false;
    }

    async function runSimulation() {
        if (isSimulating) return;
        isSimulating = true;
        btnSendPacket.disabled = true;
        
        clearLog();
        resetPacketState();

        const top = topologies[currentTopologyId];
        const sourceIp = simSourceSelect.value;
        const destIp = simDestSelect.value;
        
        const sourceNode = getNodeIdByIp(sourceIp);
        const destNode = getNodeIdByIp(destIp);

        if(sourceNode === destNode) {
            log(`Cannot send a packet to yourself! Processing halted.`, 'warning');
            isSimulating = false;
            btnSendPacket.disabled = false;
            return;
        }
        
        log(`Simulation: originating from ${sourceNode} to ${destNode}.`);
        
        // Show packet at source
        packet.style.display = 'block';
        packet.style.transition = 'none'; // Snap to start
        setPacketPosition(sourceNode);
        
        await wait(300);
        
        let currentNode = sourceNode;
        packet.style.transition = 'left 0.8s linear, top 0.8s linear, background-color 0.5s';
        
        let hops = 0;
        const MAX_HOPS = 15; // Prevent infinite routing loop
        let visitedNodes = [sourceNode]; // Track path to catch logical loops!
        
        while (currentNode !== destNode) {
            if (hops >= MAX_HOPS) {
                setPacketError();
                log(`[ERROR] TTL expired! Routing loop detected.`, 'warning');
                break;
            }
            
            // Determine Next Hop
            let nextHopNode = null;
            
            // 1. Check PBR Rules first
            let matchingRule = pbrRules.find(r => r.routerId === currentNode && r.sourceIp === sourceIp);
            if (matchingRule) {
                log(`[${currentNode}] PBR match! Forcing route via ${matchingRule.nextHop}.`, 'success');
                nextHopNode = matchingRule.nextHop;
            } else {
                // 2. Check Standard Routing Table
                const routingTable = top.routing[currentNode];
                if (routingTable) {
                    nextHopNode = routingTable[destIp] || routingTable['default'];
                }
            }
            
            if (!nextHopNode) {
                setPacketError();
                log(`[ERROR] ${currentNode} has no route to ${destIp}! Dropped.`, 'warning');
                break;
            }
            
            if (!areAdjacents(currentNode, nextHopNode)) {
                setPacketError();
                log(`[ERROR] Link from ${currentNode} to ${nextHopNode} is not physically connected! Dropped.`, 'warning');
                break;
            }
            
            // Critical Loop Detection (User Request)
            if (visitedNodes.includes(nextHopNode)) {
                setPacketError();
                let pathStr = visitedNodes.join(" -> ") + " -> " + nextHopNode;
                log(`[ERROR] Loop Detected: ${pathStr}`, 'warning');
                alert(`⚠️ Routing Notification ⚠️\n\nIt is physically impossible to route this packet! Your policy forced the packet onto an invalid path.\n\nPath trace: ${pathStr}\n\n(For example, if you sent a packet from Source 1 to Source 2, but incorrectly forced the packet through an external core router like R2, it has nowhere to go and forms a routing loop!)`);
                break;
            }
            visitedNodes.push(nextHopNode);
            
            // Move packet
            log(`[${currentNode}] Routing payload to ${nextHopNode}...`);
            setPacketPosition(nextHopNode);
            highlightLink(currentNode, nextHopNode, 800);
            
            await wait(850);
            
            currentNode = nextHopNode;
            hops++;
        }
        
        if (currentNode === destNode) {
            log(`[SUCCESS] Packet successfully reached destination ${destNode}!`, 'success');
        } else {
            alert(`Packet dropped during simulation. See logs for details.`);
        }
        
        await wait(1500);
        packet.style.display = 'none';
        isSimulating = false;
        btnSendPacket.disabled = false;
    }

    // --- Event Listeners ---
    
    btnAddRule.addEventListener('click', () => {
        const routerId = ruleRouterSelect.value;
        const sourceIp = ruleSourceSelect.value;
        const nextHop = ruleNexthopSelect.value;
        
        if (!areAdjacents(routerId, nextHop)) {
            alert(`Warning: The selected Next Hop (${nextHop}) is not physically connected to ${routerId}. The packet might be dropped!`);
        }
        
        const existingIndex = pbrRules.findIndex(r => r.routerId === routerId && r.sourceIp === sourceIp);
        if (existingIndex >= 0) {
            pbrRules[existingIndex].nextHop = nextHop;
            log(`Updated existing policy rule on ${routerId} for ${sourceIp}.`);
        } else {
            pbrRules.push({ routerId, sourceIp, nextHop });
            log(`Added new policy rule on ${routerId} for ${sourceIp}.`);
        }
        
        renderRules();
    });

    btnSendPacket.addEventListener('click', runSimulation);

    // Initial Render
    initTopologySelect();
    renderTopology();
    renderRules();
});
