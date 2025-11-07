import subprocess, hashlib, datetime

remote = subprocess.getoutput("git config --get remote.origin.url")
epoch = subprocess.getoutput("git log --reverse --format=%ct").splitlines()[0]
start = datetime.datetime.now().strftime("%Y%m%d%H%M")
raw = f"{remote}|{epoch}|{start}"
seed = hashlib.sha256(raw.encode()).hexdigest()[:12]

print("Remote URL:", remote)
print("First commit epoch:", epoch)
print("Start time:", start)
print("Seed:", seed)
with open(".env", "w") as f:
    f.write(seed + "\n")