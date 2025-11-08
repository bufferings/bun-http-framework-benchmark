# VM Setup for 2-VM Benchmarks

## Setup Instructions

### Load VM Setup

**Required Software:**
- Bun (for running benchmark scripts)
- gcloud CLI (for VM operations)
- git

**Note:** oha is installed automatically by the workflow.

**Steps:**

1. Install basic tools:
```bash
sudo apt update && sudo apt install -y curl wget unzip jq git
```

2. Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

3. Setup GitHub Actions Runner:
   - Follow: https://docs.github.com/en/actions/hosting-your-own-runners/adding-self-hosted-runners-to-a-repository
   - Add appropriate label for your VM

4. Configure as service:
   - Follow: https://docs.github.com/en/actions/hosting-your-own-runners/configuring-the-self-hosted-runner-application-as-a-service

### Target VM Setup

**Required Software:**
- Bun, Deno, Node.js (all runtimes for running framework servers)

**Steps:**

1. Install basic tools:
```bash
sudo apt update && sudo apt install -y curl wget unzip jq
```

2. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
```

3. Install Bun:
```bash
curl -fsSL https://bun.sh/install | bash
```

4. Install Deno:
```bash
curl -fsSL https://deno.land/install.sh | sh
```

**Note:** GitHub Actions runner is NOT needed on Target VM.

## Network Configuration

- Both VMs must be in the same VPC network
- Target VM must accept connections on port 3000 from Load VM
- Load VM needs SSH access to Target VM (via internal IP)
