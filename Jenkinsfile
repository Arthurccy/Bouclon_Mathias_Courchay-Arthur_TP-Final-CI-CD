pipeline {
    agent any

    environment {
        APP_IMAGE = 'taskflow-api'
        APP_URL = 'http://localhost'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                sh 'git log --oneline -1 || true'
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker') {
            steps {
                sh '''
                    docker build \
                        -t ${APP_IMAGE}:latest \
                        -t ${APP_IMAGE}:build-${BUILD_NUMBER} .
                '''
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: 'mongo-uri', variable: 'JENKINS_MONGO_URI')]) {
                    sh '''
                        if [ ! -f .env ]; then
                            cp .env.example .env
                        fi

                        if grep -q '^MONGO_URI=' .env; then
                            sed -i "s#^MONGO_URI=.*#MONGO_URI=${JENKINS_MONGO_URI}#" .env
                        else
                            echo "MONGO_URI=${JENKINS_MONGO_URI}" >> .env
                        fi

                        docker compose up -d --remove-orphans mongodb api nginx
                        docker compose ps mongodb api nginx
                    '''
                }
            }
        }
    }

    post {
        always {
            echo 'Test coverage summary:'
            sh 'if [ -f coverage/coverage-summary.json ]; then cat coverage/coverage-summary.json; else echo "Coverage summary not generated."; fi'
        }

        success {
            echo "Pipeline successful. TaskFlow API is available at ${APP_URL}"
        }

        failure {
            echo "Pipeline failed. Check the failed stage above, then inspect logs with: docker compose logs --tail=100"
        }
    }
}
