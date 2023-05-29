## Resource link

##Link https://cloud.google.com/container-registry/docs/enable-service

# Get project name & number

gcloud projects list

# set project

gcloud config set project signally-c7cd9

# Submit build

gcloud builds submit --tag gcr.io/signally-c7cd9/signally-node-server

# check permission

gcloud projects get-iam-policy signally-c7cd9 \
--flatten="bindings[].members" \
--format='table(bindings.role)' \
--filter="bindings.members:service-934351940492@containerregistry.iam.gserviceaccount.com"

# Grant the Container Registry Service Agent role and revoke the Editor role

gcloud projects add-iam-policy-binding signally-c7cd9 \
--member=serviceAccount:service-934351940492@containerregistry.iam.gserviceaccount.com --role=roles/containerregistry.ServiceAgent

# Build

gcloud builds submit --tag gcr.io/signally-c7cd9/signally-node-server

# Run

gcloud run deploy signally-node-server \
 --image gcr.io/signally-c7cd9/signally-node-server \
 --platform managed \
 --region us-central1 \
 --allow-unauthenticated

# Combined

gcloud config set project signally-c7cd9 && gcloud builds submit --tag gcr.io/signally-c7cd9/signally-node-server-api-1 &&
gcloud run deploy signally-node-server-api-1 --image gcr.io/signally-c7cd9/signally-node-server-api-1 --platform managed --region us-central1 --allow-unauthenticated
