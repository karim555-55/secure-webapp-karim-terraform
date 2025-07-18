 AWS Proxy & Backend Infrastructure using Terraform by Karim Alaa
This project provisions a 2-tier web application infrastructure on AWS, fully automated with Terraform.
The setup includes:

A public NGINX proxy EC2 instance in the public subnet

A private backend EC2 instance running a Flask app inside the private subnet

Fully modular Terraform design for flexibility and easy maintenance

Backend App: cuteblog-flask blog-style Flask application

<h2 align="center">🗺️ Network Architecture</h2> <p align="center"> <img src="./arch.PNG" alt="Architecture Diagram" width="700"/> </p>
How it works:

All user traffic goes through NGINX (proxy layer), which forwards HTTP requests internally to the Flask backend.

The backend EC2 is fully private—no direct internet access.

Custom VPC, Subnets, Route Tables, and Security Groups manage the flow of traffic.

 Project Layout
bash
Copy
Edit
.
├── main.tf                 # Infrastructure setup (Root Terraform)
├── backendscript.sh        # Backend EC2 provisioning script
├── proxyscript.sh          # Proxy EC2 provisioning script
├── terraform.tfvars        # Variables for deployment
├── flask_website/
│   └── cuteblog-flask/     # Flask Application (Backend)
├── modules/
│   ├── vpc_mod/            # VPC Module
│   ├── subnet_mod_pup/     # Public Subnet Module
│   ├── subnet_mod_priv/    # Private Subnet Module
│   ├── route_table_mod/    # Route Table Module
│   ├── instance_proxy_mod/ # Proxy EC2 Instance Module
│   └── instance_backend_mod/ # Backend EC2 Instance Module
 Deployment Guide
Pre-requisites:
AWS CLI with valid credentials

Terraform ≥ 1.3 installed

SSH Key Pair available

Commands:
bash
Copy
Edit
terraform init       # Initialize Terraform project
terraform plan       # Preview changes
terraform apply      # Deploy infrastructure
After deployment:

Check all_ips.txt for generated public and private IP addresses.

Connect to the proxy instance:

bash
Copy
Edit
ssh -i ~/.ssh/project.pem ec2-user@<proxy-public-ip>
⚙️ Provisioning Overview
🔹 Proxy EC2 Instance (Public Layer)
Uses file provisioner to upload proxyscript.sh.

Uses remote-exec to:

Install & configure NGINX as reverse proxy

Route traffic to the backend's private IP

 Backend EC2 Instance (Private Layer)
Uploads the Flask App and backendscript.sh using file.

Executes the setup with remote-exec to:

Install dependencies (Flask, Gunicorn, etc.)

Launch the backend web server

 Security Model
Proxy EC2: Open to HTTP (80) and SSH (22) from authorized IPs.

Backend EC2: Accessible only from proxy via Security Groups.

NAT Gateway: Provides internet access for backend updates if needed.

All backend provisioning happens securely through the proxy layer. The backend instances remain private and unreachable from the public internet.

🧪 Backend Flask Application
Location: flask_website/cuteblog-flask/

Main script: app.py

Templates: templates/

Stylesheet: static/cute.css
Summary
This project provides a secure, modular, and automated AWS infrastructure using Terraform. It simulates real-world production setups with public proxy layers and private backend services.
