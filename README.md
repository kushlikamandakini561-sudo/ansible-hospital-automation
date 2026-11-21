# Ansible Automation - City Care Hospital

## 1. Research - What is Ansible?
Ansible is an open-source IT automation tool developed by Red Hat.
It is used to install software, configure servers, deploy applications, and manage users, files, and services automatically.

Main Idea: Instead of logging into 10 servers one by one, you write ONE file and Ansible does it for all 10.

## 2. How Does Ansible Work?
Ansible is Agentless and Push-based.
- Control Node: Your Laptop / Main Server where Ansible runs
- Managed Nodes: Servers to automate (Web Server 1, 2, 3)
- Connection: SSH
- Language: YAML - easy to read
- Inventory: Server list in inventory.ini
- Playbook: Tasks written in YAML in site.yml
- Modules: Ready-made commands like apt, copy, service
- Idempotency: Running playbook 10 times gives same result. It will not reinstall what is already installed.

Workflow:
1. You write Playbook (YAML)
2. Ansible reads Inventory
3. Connects via SSH
4. Executes Modules
5. All servers become same state

## 3. Automation Task I Did
Task: Automate Hospital Web Server Setup

Problem: Setting up Nginx and deploying hospital website manually on many servers takes hours.

Solution: One Ansible Playbook does it in 1 minute.

What this Playbook (site.yml) does automatically:
1. Update apt cache
2. Install Nginx
3. Copy custom hospital website (index.html)
4. Start and Enable Nginx service
5. Allow HTTP Port 80

## 4. How to Run

Step 1 - Install Ansible:
sudo apt update
sudo apt install ansible -y

Step 2 - Check connection:
ansible -i inventory.ini all -m ping

Step 3 - Run Playbook:
ansible-playbook -i inventory.ini site.yml

Step 4 - Verify:
Open browser and go to http://localhost
You will see City Care Hospital website.

## 5. Files in this Project
- inventory.ini - List of servers
- site.yml - Main Ansible Playbook (Automation Task)
- index.html - Hospital Website
- app.js - Website logic
- style.css - Website design

## 6. Result & Conclusion
Before Ansible: 5 Servers = 1-2 Hours manual work, many human errors
After Ansible: 5 Servers = 1 Minute, 100% Same Config, One Command

Conclusion: Ansible is best for beginners because it needs no agent, uses simple YAML, and saves huge time. This project proves repetitive tasks like Web Server setup can be fully automated.

## Live Website
https://kushlikamandakini561-sudo.github.io/ansible-hospital-automation/
