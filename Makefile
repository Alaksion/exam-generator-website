PROJECT ?= mock-exams-website
STAGE ?= prod
AWS_REGION ?= us-east-1

OIDC_STACK := exam-generator-website-github-bootstrap
SITE_STACK := $(PROJECT)-$(STAGE)

OIDC_TEMPLATE := infra/github-actions-oidc-role.yaml
SITE_TEMPLATE := infra/static-site.yaml

STAGES := dev staging prod

PARAM_OVERRIDES := Stage=$(STAGE)
ifdef DOMAIN
PARAM_OVERRIDES += DomainName=$(DOMAIN)
endif
ifdef CERT_ARN
PARAM_OVERRIDES += CertificateArn=$(CERT_ARN)
endif

.PHONY: help validate deploy deploy-oidc deploy-site outputs url

help:
	@echo "Usage: make <target> [STAGE=prod|staging|dev] [AWS_REGION=us-east-1]"
	@echo ""
	@echo "  deploy          Provision deploy role + static site stack for STAGE"
	@echo "  deploy-oidc     Create the GitHub Actions deploy role (OIDC provider is shared)"
	@echo "  deploy-site     Provision/update the S3+CloudFront stack for STAGE"
	@echo "  validate        Validate both CloudFormation templates"
	@echo "  outputs         Show the site stack outputs for STAGE"
	@echo "  url             Print the public URL for STAGE"
	@echo ""
	@echo "deploy-site accepts DOMAIN=app.example.com and CERT_ARN=arn:... for a custom domain"

validate:
	aws cloudformation validate-template --template-body file://$(OIDC_TEMPLATE) --region $(AWS_REGION)
	aws cloudformation validate-template --template-body file://$(SITE_TEMPLATE) --region $(AWS_REGION)

deploy-oidc:
	aws cloudformation deploy \
		--stack-name $(OIDC_STACK) \
		--template-file $(OIDC_TEMPLATE) \
		--capabilities CAPABILITY_NAMED_IAM \
		--region $(AWS_REGION)

deploy-site: check-stage
	aws cloudformation deploy \
		--stack-name $(SITE_STACK) \
		--template-file $(SITE_TEMPLATE) \
		--parameter-overrides $(PARAM_OVERRIDES) \
		--region $(AWS_REGION)

deploy: deploy-oidc deploy-site

outputs: check-stage
	@aws cloudformation describe-stacks \
		--stack-name $(SITE_STACK) \
		--query 'Stacks[0].Outputs' \
		--region $(AWS_REGION) \
		--output json | jq '.[] | {OutputKey, OutputValue}'

url: check-stage
	@aws cloudformation describe-stacks \
		--stack-name $(SITE_STACK) \
		--query 'Stacks[0].Outputs' \
		--region $(AWS_REGION) \
		--output json | jq -r '.[] | select(.OutputKey == "CloudFrontDomain") | .OutputValue'

check-stage:
	@echo "$(STAGES)" | tr ' ' '\n' | grep -qx '$(STAGE)' \
		|| (echo "invalid STAGE '$(STAGE)' (allowed: $(STAGES))" >&2; exit 1)
