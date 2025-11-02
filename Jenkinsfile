pipeline {
    agent any

    environment {
        // Build Information
        BUILD_TAG = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()

        // Environment Configuration
        DEPLOY_ENV = "${params.ENVIRONMENT ?: 'dev'}"
    }

    parameters {
        choice(
            name: 'ENVIRONMENT',
            choices: ['dev', 'staging', 'production'],
            description: 'Select deployment environment'
        )
        booleanParam(
            name: 'CLEAN_VOLUMES',
            defaultValue: false,
            description: 'Remove volumes (clears database)'
        )
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "Checking out code..."
                    checkout scm
                    echo "Deploying to environment: ${DEPLOY_ENV}"
                    echo "Build: ${BUILD_TAG}, Commit: ${GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Validate') {
            steps {
                script {
                    echo "Validating Docker Compose configuration..."
                    sh 'docker-compose config'
                }
            }
        }

        stage('Prepare Environment') {
            steps {
                script {
                    echo "Preparing environment configuration..."

                    // Create environment-specific .env file
                    sh """
                        cat > .env <<EOF
MYSQL_ROOT_PASSWORD=\${MYSQL_ROOT_PASSWORD_${DEPLOY_ENV.toUpperCase()}}
MYSQL_DATABASE=tourist_db
MYSQL_USER=tourist_user
MYSQL_PASSWORD=\${MYSQL_PASSWORD_${DEPLOY_ENV.toUpperCase()}}
MYSQL_PORT=3306
PHPMYADMIN_PORT=8080
APP_PORT=5000
FRONTEND_PORT=3000
NODE_ENV=${DEPLOY_ENV}
EOF
                    """

                    echo "Environment configuration created"
                    sh 'cat .env'
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Deploying to ${DEPLOY_ENV} environment using Docker Compose..."

                    // Add approval for production
                    if (DEPLOY_ENV == 'production') {
                        input message: 'Deploy to Production?', ok: 'Deploy'
                    }

                    // Stop existing containers
                    def downCommand = 'docker-compose down'
                    if (params.CLEAN_VOLUMES) {
                        echo "WARNING: Removing volumes (database will be cleared)"
                        downCommand = 'docker-compose down -v'
                    }
                    sh downCommand

                    // Build and start services
                    sh """
                        docker-compose build --no-cache
                        docker-compose up -d
                    """

                    echo "Deployment completed"
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    echo "Waiting for services to start..."
                    sh 'sleep 15'

                    echo "Performing health check..."

                    sh """
                        # Check if containers are running
                        docker-compose ps

                        # Wait for API to be ready (max 60 seconds)
                        timeout 60 bash -c 'until curl -f http://localhost:5000/health; do sleep 2; done' || exit 1

                        # Check attractions endpoint
                        curl -f http://localhost:5000/attractions || exit 1

                        echo "Health check passed!"
                    """
                }
            }
        }

        stage('Verify Deployment') {
            steps {
                script {
                    echo "Verifying all services..."

                    sh """
                        echo "=== Container Status ==="
                        docker-compose ps

                        echo ""
                        echo "=== Service Logs (last 20 lines) ==="
                        docker-compose logs --tail=20

                        echo ""
                        echo "=== Deployed Services ==="
                        echo "Frontend: http://localhost:3000"
                        echo "API: http://localhost:5000"
                        echo "phpMyAdmin: http://localhost:8080"
                    """
                }
            }
        }
    }

    post {
        success {
            echo "✅ Deployment completed successfully!"
            echo "Environment: ${DEPLOY_ENV}"
            echo "Build: ${BUILD_TAG}"
            echo "Commit: ${GIT_COMMIT_SHORT}"
            echo ""
            echo "Access your application:"
            echo "  - Frontend: http://localhost:3000"
            echo "  - API: http://localhost:5000"
            echo "  - phpMyAdmin: http://localhost:8080"
        }

        failure {
            echo "❌ Deployment failed!"

            script {
                echo "Printing container logs for debugging..."
                sh 'docker-compose logs --tail=50 || true'
            }
        }

        always {
            echo "Cleaning up old Docker resources..."
            sh """
                # Remove dangling images
                docker image prune -f

                # Remove old containers
                docker container prune -f
            """
        }
    }
}
