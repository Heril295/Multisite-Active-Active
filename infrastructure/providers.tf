terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Primary Region
provider "aws" {
  region = "us-east-1"
  alias  = "east"
}

# Secondary (Failover) Region
provider "aws" {
  region = "us-west-2"
  alias  = "west"
}
