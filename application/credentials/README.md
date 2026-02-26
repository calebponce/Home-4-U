# Home4U Cloud Credentials

> **IMPORTANT**: This folder contains all credentials and files needed to access the Home4U cloud infrastructure. Follow the steps below exactly as written.

---

## Quick Start (5 Minutes)

### Step 1: Download PEM Key
1. Go to this folder in GitHub
2. Click on `home4u-key.pem`
3. Click "Download" button

### Step 2: Set Up PEM Key (macOS/Linux)
```bash
# Open Terminal and navigate to downloaded file
cd ~/Downloads

# Set correct permissions
chmod 400 home4u-key.pem
```

### Step 3: Connect to Server
```bash
ssh -i home4u-key.pem ec2-user@18.225.117.117
```

### Step 4: Access Database
```bash
# After connecting, run:
sudo -u postgres psql -d home4u
```

---

## Table of Contents

1. [AWS Account Information](#aws-account-information)
2. [EC2 Instance Details](#ec2-instance-details)
3. [Step-by-Step SSH Access](#step-by-step-ssh-access)
4. [Database Access Instructions](#database-access-instructions)
5. [PEM Key Setup](#pem-key-setup)
6. [Troubleshooting](#troubleshooting)
7. [Contact](#contact)

---

## AWS Account Information

| Item | Value |
|------|-------|
| **AWS Account ID** | 0974-5736-7365 |
| **AWS Account Name** | vibingcaleb |
| **Region** | us-east-2 (Ohio) |

---

## EC2 Instance Details

| Item | Value |
|------|-------|
| **Instance ID** | i-048b1547e5254509c |
| **Instance Name** | Home4U |
| **Instance Type** | t3.micro |
| **Public IP Address** | 18.225.117.117 |
| **Public DNS** | ec2-18-225-117-117.us-east-2.compute.amazonaws.com |
| **SSH Username** | ec2-user |
| **SSH Port** | 22 |

---

## Step-by-Step SSH Access

### Windows Users (Using PuTTY)

1. **Download PEM Key** from this folder
2. **Convert PEM to PPK** using PuTTYgen:
   - Open PuTTYgen → Load → Select home4u-key.pem → Save private key
3. **Connect with PuTTY**:
   - Host: `ec2-user@18.225.117.117`
   - Port: 22
   - SSH → Auth → Browse for your PPK file

### macOS / Linux Users

#### Step 1: Download the PEM Key
1. Navigate to this folder in the GitHub repository
2. Click on `home4u-key.pem`
3. Click the "Download" button
4. Save to your Downloads folder

#### Step 2: Set Permissions
Open Terminal and run:

```bash
cd ~/Downloads
chmod 400 home4u-key.pem
```

#### Step 3: Connect to EC2
Run this command in Terminal:

```bash
ssh -i ~/Downloads/home4u-key.pem ec2-user@18.225.117.117
```

**Expected Result:**
```
The authenticity of host '18.225.117.117 (18.225.117.117)' can't be established.
ECDSA key fingerprint is SHA256:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.
Are you sure you (yes/no)? want to continue connecting yes
Warning: Permanently added '18.225.117.117' (ECDSA) to the list of known hosts.
```

#### Step 4: Verify Connection
Once connected, you should see the command prompt change to:
```
[ec2-user@ip-172-31-13-59 ~]$
```

---

## Database Access Instructions

### Important: No Password Required

The database uses **peer authentication**, meaning you access it without a password when logged in as the `ec2-user`.

### After SSH Connection:

#### Option 1: Access PostgreSQL (Recommended)

Run this command on the EC2 server:

```bash
sudo -u postgres psql -d home4u
```

**Expected Result:**
```
psql (14.9)
Type "help" for help.

home4u=#
```

#### Option 2: List All Databases

```bash
sudo -u postgres psql -l
```

#### Option 3: List Tables in home4u Database

```bash
sudo -u postgres psql -d home4u -c "\dt"
```

---

## PEM Key Setup

### For macOS / Linux

```bash
# Navigate to where you saved the file
cd ~/Downloads

# Set permissions (REQUIRED - otherwise SSH will fail)
chmod 400 home4u-key.pem

# Test SSH connection
ssh -i home4u-key.pem ec2-user@18.225.117.117
```

### For Windows (PowerShell)

```powershell
# Set permissions
icacls home4u-key.pem /inheritance:r
icacls home4u-key.pem /grant:r "$($env:USERNAME):(R)"
```

### For Windows (Using Git Bash)

```bash
chmod 400 home4u-key.pem
ssh -i home4u-key.pem ec2-user@18.225.117.117
```

---

## Troubleshooting

### Problem: "Permission Denied (publickey)"

**Cause:** PEM file permissions are too open

**Solution:**
```bash
chmod 400 home4u-key.pem
```

---

### Problem: "Connection Timed Out"

**Cause:** Security group not allowing your IP

**Solution:**
1. Go to AWS Console → EC2 → Security Groups
2. Check inbound rules for SSH (port 22)
3. Your IP needs to be allowed

---

### Problem: "Host Key Verification Failed"

**Cause:** Server was recreated, old key cached

**Solution:**
```bash
ssh-keygen -R 18.225.117.117
ssh-keygen -R ec2-18-225-117-117.us-east-2.compute.amazonaws.com
```

---

### Problem: "Database connection refused"

**Cause:** PostgreSQL may not be running

**Solution:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Start PostgreSQL if not running
sudo systemctl start postgresql
```

---

### Problem: "psql: could not connect to server"

**Cause:** PostgreSQL not installed or not started

**Solution:**
```bash
# Check if PostgreSQL is installed
which psql

# Install PostgreSQL if needed
sudo yum install postgresql postgresql-server
```

---

## Quick Reference Commands

| Task | Command |
|------|---------|
| **SSH Connect** | `ssh -i home4u-key.pem ec2-user@18.225.117.117` |
| **List Databases** | `sudo -u postgres psql -l` |
| **Connect to home4u** | `sudo -u postgres psql -d home4u` |
| **List Tables** | `sudo -u postgres psql -d home4u -c "\dt"` |
| **Exit Database** | `\q` |
| **Exit SSH** | `exit` |

---

## What to Do If Still Having Issues

1. **Double-check the IP address**: Make sure you're using `18.225.117.117`
2. **Verify PEM file location**: Use the full path like `~/Downloads/home4u-key.pem`
3. **Check permissions**: Run `ls -la home4u-key.pem` - should show `-r--------`
4. **Try with verbose mode**: `ssh -v -i home4u-key.pem ec2-user@18.225.117.117`

---

## Contact

If you have followed all steps exactly and still cannot connect:

- **Team Lead**: Caleb Ponce - cponce8@sfsu.edu
- **Backend Lead**: [To be assigned]

---

## File Manifest

| File | Description |
|------|-------------|
| `README.md` | This instruction file |
| `home4u-key.pem` | SSH private key for EC2 access |

---

*Last Updated: 2026-02-25*
*Follow steps exactly in order - do not skip any step*

