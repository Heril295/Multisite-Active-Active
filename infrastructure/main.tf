# ==========================================
# REGION 1: US-EAST-1 (Primary)
# ==========================================

module "vpc_east" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  
  # Tell this module to use the "east" provider
  providers = { aws = aws.east }

  name = "gitops-vpc-east"
  cidr = "10.1.0.0/16"

  azs             = ["us-east-1a", "us-east-1b"]
  private_subnets = ["10.1.1.0/24", "10.1.2.0/24"]
  public_subnets  = ["10.1.101.0/24", "10.1.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

module "eks_east" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"
  providers = { aws = aws.east }

  cluster_name    = "gitops-cluster-east"
  cluster_version = "1.30"

  vpc_id                         = module.vpc_east.vpc_id
  subnet_ids                     = module.vpc_east.private_subnets
  
  # We leave this public for now to bootstrap. 
  # In Step 3, we will lock it down with Tailscale!
  cluster_endpoint_public_access = true 

  eks_managed_node_groups = {
    default = {
      min_size       = 1
      max_size       = 2
      desired_size   = 1
      instance_types = ["t3.medium"]
    }
  }
  
  # Automatically grants your IAM user admin rights to the cluster
  enable_cluster_creator_admin_permissions = true
}

# ==========================================
# REGION 2: US-WEST-2 (Secondary)
# ==========================================

module "vpc_west" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  providers = { aws = aws.west }

  name = "gitops-vpc-west"
  cidr = "10.2.0.0/16"

  azs             = ["us-west-2a", "us-west-2b"]
  private_subnets = ["10.2.1.0/24", "10.2.2.0/24"]
  public_subnets  = ["10.2.101.0/24", "10.2.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
}

module "eks_west" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"
  providers = { aws = aws.west }

  cluster_name    = "gitops-cluster-west"
  cluster_version = "1.30"

  vpc_id                         = module.vpc_west.vpc_id
  subnet_ids                     = module.vpc_west.private_subnets
  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    default = {
      min_size       = 1
      max_size       = 2
      desired_size   = 1
      instance_types = ["t3.medium"]
    }
  }
  
  enable_cluster_creator_admin_permissions = true
}
