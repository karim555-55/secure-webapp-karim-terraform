variable "cidr_block" {
    description = "CIDR block to define the subnet range"
}

variable "vpc_id" {
    description = "The VPC ID where the subnet will be created"
}

variable "Name" {
    description = "Subnet identifier name"
}

variable "availability_zone" {
    description = "AWS Availability Zone for the subnet"
}
