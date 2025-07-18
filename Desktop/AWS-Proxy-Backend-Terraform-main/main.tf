# -----------------------------------------------------------
# Project: Karim Proxy-Backend AWS Infra (Customized)
# Author: Karim Alaa Ibrahim
# -----------------------------------------------------------

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

# =======================
# VPC Module
# =======================
module "karim_vpc" {
  source     = "./modules/vpc_mod"
  cidr_block = "10.10.0.0/16"
}

# =======================
# Elastic IP for NAT
# =======================
resource "aws_eip" "karim_nat_eip" {
  domain = "vpc"
}

# =======================
# Key Pair
# =======================
resource "aws_key_pair" "karim_key" {
  key_name   = "karim-project-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

# =======================
# S3 for Terraform State
# =======================
resource "aws_s3_bucket" "karim_tf_state" {
  bucket = "karim-terraform-backend-bucket-unique"

  tags = {
    Owner       = "Karim Alaa"
    Environment = "Terraform-State"
  }
}

# =======================
# DynamoDB for Locking
# =======================
resource "aws_dynamodb_table" "karim_tf_lock" {
  name         = "karim-terraform-lock"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# =======================
# Internet Gateway & NAT
# =======================
resource "aws_internet_gateway" "karim_gw" {
  vpc_id = module.karim_vpc.project_vpc-id

  tags = {
    Name  = "Karim-IGW"
  }
}

resource "aws_nat_gateway" "karim_nat" {
  allocation_id = aws_eip.karim_nat_eip.id
  subnet_id     = module.karim_pub_sub_2.puplic_subnet_id_1

  tags = {
    Name = "Karim-NAT-GW"
  }

  depends_on = [ aws_eip.karim_nat_eip ]
}

# =======================
# Public Subnets
# =======================
module "karim_pub_sub_1" {
  source            = "./modules/subnet_mod_pup"
  cidr_block        = "10.10.0.0/24"
  vpc_id            = module.karim_vpc.project_vpc-id
  Name              = "Karim-Public-Subnet-1"
  availability_zone = "us-east-1a"
}

module "karim_pub_sub_2" {
  source            = "./modules/subnet_mod_pup"
  cidr_block        = "10.10.2.0/24"
  vpc_id            = module.karim_vpc.project_vpc-id
  Name              = "Karim-Public-Subnet-2"
  availability_zone = "us-east-1b"
}

# =======================
# Private Subnets
# =======================
module "karim_priv_sub_1" {
  source            = "./modules/subnet_mod_priv"
  cidr_block        = "10.10.1.0/24"
  vpc_id            = module.karim_vpc.project_vpc-id
  Name              = "Karim-Private-Subnet-1"
  availability_zone = "us-east-1a"
}

module "karim_priv_sub_2" {
  source            = "./modules/subnet_mod_priv"
  cidr_block        = "10.10.3.0/24"
  vpc_id            = module.karim_vpc.project_vpc-id
  Name              = "Karim-Private-Subnet-2"
  availability_zone = "us-east-1b"
}

# =======================
# Route Tables
# =======================
module "karim_route_table" {
  source     = "./modules/route_table_mod"
  cidr_block = "0.0.0.0/0"
  vpc_id     = module.karim_vpc.project_vpc-id
  Name       = "Karim-Route-Public"
  IGW        = aws_internet_gateway.karim_gw.id
}

resource "aws_route_table" "karim_private_route" {
  vpc_id = module.karim_vpc.project_vpc-id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.karim_nat.id
  }

  tags = {
    Name = "Karim-Private-Route"
  }
}

# =======================
# Associate Route Tables
# =======================
resource "aws_route_table_association" "karim_public_a" {
  subnet_id      = module.karim_pub_sub_1.puplic_subnet_id_1
  route_table_id = module.karim_route_table.route_table_id
}

resource "aws_route_table_association" "karim_public_b" {
  subnet_id      = module.karim_pub_sub_2.puplic_subnet_id_1
  route_table_id = module.karim_route_table.route_table_id
}

resource "aws_route_table_association" "karim_private_a" {
  subnet_id      = module.karim_priv_sub_1.private_subnet_id
  route_table_id = aws_route_table.karim_private_route.id
}

resource "aws_route_table_association" "karim_private_b" {
  subnet_id      = module.karim_priv_sub_2.private_subnet_id
  route_table_id = aws_route_table.karim_private_route.id
}

# =======================
# Security Groups
# =======================
resource "aws_security_group" "karim_proxy_sg" {
  name        = "Karim-Proxy-SG"
  description = "Allow HTTP, SSH, and Proxy Traffic"
  vpc_id      = module.karim_vpc.project_vpc-id
}

resource "aws_vpc_security_group_ingress_rule" "karim_http" {
  security_group_id = aws_security_group.karim_proxy_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 80
  ip_protocol       = "tcp"
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "karim_ssh" {
  security_group_id = aws_security_group.karim_proxy_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  from_port         = 22
  ip_protocol       = "tcp"
  to_port           = 22
}

resource "aws_vpc_security_group_egress_rule" "karim_all_egress" {
  security_group_id = aws_security_group.karim_proxy_sg.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
}

# =======================
# AMI
# =======================
data "aws_ami" "karim_amzlinux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

# =======================
# EC2 Instances (Proxy & Backend)
# =======================
module "karim_proxy" {
  source              = "./modules/instance_proxy_mod"
  ami_id              = data.aws_ami.karim_amzlinux.image_id
  instance_type       = "t2.micro"
  subnet_id           = module.karim_pub_sub_1.puplic_subnet_id_1
  security_group_id   = aws_security_group.karim_proxy_sg.id
  key_name            = aws_key_pair.karim_key.key_name
  private_key_path    = "~/.ssh/id_rsa"
  script_source       = "karim_proxy_setup.sh"
  backend_dns         = aws_lb.karim_backend_lb.dns_name
}

module "karim_backend" {
  source              = "./modules/instance_backend_mod"
  ami_id              = data.aws_ami.karim_amzlinux.image_id
  instance_type       = "t2.micro"
  subnet_id           = module.karim_priv_sub_1.private_subnet_id
  security_group_id   = aws_security_group.karim_proxy_sg.id
  key_name            = aws_key_pair.karim_key.key_name
  private_key_path    = "~/.ssh/id_rsa"
  flask_app_path      = "karim_flask_app"
  setup_script_path   = "karim_backend_setup.sh"
}

# =======================
# Load Balancers
# =======================
resource "aws_lb" "karim_backend_lb" {
  name               = "karim-backend-lb"
  internal           = true
  load_balancer_type = "application"
  security_groups    = [aws_security_group.karim_proxy_sg.id]
  subnets            = [module.karim_priv_sub_1.private_subnet_id, module.karim_priv_sub_2.private_subnet_id]
}

resource "aws_lb_target_group" "karim_backend_tg" {
  name     = "karim-backend-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = module.karim_vpc.project_vpc-id
}

resource "aws_lb_listener" "karim_backend_listener" {
  load_balancer_arn = aws_lb.karim_backend_lb.arn
  port              = 5000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.karim_backend_tg.arn
  }
}

