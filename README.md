# Policy Based Routing (PBR) Simulator 🚀

A highly interactive, visual network simulation tool entirely built on the frontend using Vanilla JavaScript, HTML, and CSS. This tool demonstrates the mechanics of advanced computer networking—specifically focusing on algorithmic path selection and Policy-Based Routing.

## ✨ Features

- **Variable & Custom Topologies:** Dynamically create network maps with between 1-6 Source PCs and 1-6 Destination Servers. The mathematical engine auto-generates Ingress switches, Egress Switches, and redundant Core ISP Routers based on scale.
- **Graph Routing Engine:** Implements hop-by-hop packet navigation! Computations rely on generated default routing tables mapping physical link adjacencies rather than hard-coded animations.
- **Policy-Based Routing (PBR):** Users can add overriding rule sets simulating firewall or specialized traffic-shaping commands directly onto specific Core Routers in the graph. By setting specific Source-IP policies, custom Traffic Engineering scenarios are visually represented.
- **Loop & Trap Detection:** Built-in safeguards actively evaluate policies during simulations. If a user defines an impossible route resulting in a U-Turn or routing loop, the engine halts the simulation tracking and surfaces an explicit physical routing notification alert.
- **Beautiful UI:** Developed with modern Glassmorphism-style design aesthetics, color-coded components, smooth CSS transition routing links, and interactive visual logs. 

## 🛠️ Technology Stack
- **HTML5:** Scalable Native structural layouts and standard Web Forms. 
- **Vanilla JavaScript (ES6+):** Pure DOM manipulation, algorithms, state tracking, and matrix mathematical generation components — No external libraries needed!
- **CSS3:** Custom Variables (`:root`), Flexbox/Grid alignment, keyframes layout, SVG styling techniques, and robust typography integrations.

## 🚀 How to Run

Because this project is built entirely out of static front-end assets, no server instance is required!

1. Clone or download this repository to your local machine.
2. Locate and open the `index.html` file using your favorite modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).
3. The dashboard will load instantaneously.

## 🎮 How to use the Simulator
1. Toggle the **Network Topology** dropdown. Pick one of the default layouts or choose **Custom Setup...** to spawn your own.
2. In the `Simulation` panel, set your target Source and Destination limits. Pay attention to their IP addresses.
3. Click **SEND PACKET**. Watch the default shortest-path routing table operate.
4. Go to **Add Policy Rule**. Specify a new `Next Hop` that diverges from normal routing logic intentionally affecting your specified Host Node. 
5. Resend the packet and watch the trajectory manually adhere to your newly programmed path priorities! 

## 📝 License
This project was designed for educational and conceptual computer networking testing. It highlights the direct applications of graphing algorithms interacting alongside Policy logic logic arrays. Feel free to use and modify the source code for personal or academic reasons!
