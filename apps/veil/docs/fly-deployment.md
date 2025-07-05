# Fly.io PR Deployment Documentation

## Overview

This document describes the ephemeral deployment system for Veil pull requests using Fly.io. The system allows authorized developers to deploy PR branches for testing and review.

## Architecture

### Components

1. **Dockerfile**: Minimal container build optimized for Next.js standalone deployment
2. **fly.toml**: Fly.io application configuration with environment variables
3. **GitHub Actions workflows**: Automated deployment and cleanup processes
4. **Fly.io infrastructure**: Hosting platform for ephemeral deployments

### Deployment Flow

1. Developer comments `/deploy` on a pull request
2. GitHub Action validates organization membership
3. Application builds with PR-specific configuration
4. Deployment creates unique Fly.io application
5. URL posted as comment on pull request
6. Automatic cleanup after 12 hours or PR closure

## Prerequisites

### Repository Configuration

1. **GitHub Secrets Required**:
   - `FLY_API_TOKEN`: Authentication token for Fly.io API
   - `PENUMBRA_INDEXER_ENDPOINT`: PostgreSQL connection string
   - `PENUMBRA_INDEXER_CA_CERT`: Database certificate content

2. **Fly.io Account Setup**:
   ```bash
   # Install Fly CLI
   curl -L https://fly.io/install.sh | sh
   
   # Authenticate
   fly auth login
   
   # Create API token
   fly tokens create deploy-token
   ```

3. **Organization Settings**:
   - Ensure GitHub Actions has read access to organization membership
   - Configure appropriate permissions for workflow execution

## Usage

### Deploying a Pull Request

1. Create or update a pull request
2. Comment `/deploy` on the pull request
3. Wait for deployment confirmation comment
4. Access application at `https://veil-pr-{number}.fly.dev`

### Manual Cleanup

If automatic cleanup fails:

```bash
# List PR deployments
fly apps list | grep veil-pr-

# Delete specific deployment
fly apps destroy veil-pr-123 --yes
```

## Technical Details

### Environment Variables

Production configuration from `prod.sh`:
- `PENUMBRA_GRPC_ENDPOINT`: Remote node endpoint
- `PENUMBRA_INDEXER_ENDPOINT`: Database connection (set via secrets)
- `PENUMBRA_INDEXER_CA_CERT`: SSL certificate (set via secrets)
- `PENUMBRA_CHAIN_ID`: Network identifier

### Build Process

1. Multi-stage Docker build reduces final image size
2. Next.js standalone output minimizes dependencies
3. Dynamic `BASE_URL` injection for proper routing
4. Certificate files copied if present

### Resource Allocation

- Memory: 512MB
- CPU: 1 shared CPU
- Region: iad (US East)
- Auto-scaling: Disabled for PR deployments

## Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Verify GitHub secrets are correctly set
   - Check Fly.io API token validity
   - Review build logs for compilation errors

2. **Application Not Accessible**
   - Confirm deployment completed successfully
   - Check Fly.io application logs: `fly logs --app veil-pr-{number}`
   - Verify health check endpoint responds

3. **Cleanup Not Working**
   - Check scheduled workflow execution in GitHub Actions
   - Verify cleanup workflow has necessary permissions
   - Manual cleanup may be required for orphaned deployments

### Debugging Commands

```bash
# View application status
fly status --app veil-pr-123

# Check application logs
fly logs --app veil-pr-123

# SSH into running container
fly ssh console --app veil-pr-123

# View secrets (names only)
fly secrets list --app veil-pr-123
```

## Maintenance

### Updating Dependencies

1. Modify `Dockerfile` for build process changes
2. Update `fly.toml` for configuration adjustments
3. Test changes on a sample PR before merging

### Security Considerations

1. Organization membership validated for each deployment
2. Secrets never exposed in logs or comments
3. Automatic cleanup prevents resource accumulation
4. Each deployment isolated in separate Fly.io application

### Cost Management

1. Deployments automatically stop when not in use
2. 12-hour lifetime limit prevents forgotten deployments
3. Single region deployment minimizes costs
4. Shared CPU tier appropriate for testing

## References

- [Fly.io Documentation](https://fly.io/docs/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)