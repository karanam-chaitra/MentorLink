pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Backend Lint & Test') {
            steps {
                dir('backend') {
                    sh 'npm install'
                    sh 'npm run lint'
                    sh 'npm test'
                }
            }
        }
        stage('ML Service Test') {
            steps {
                dir('ml-service') {
                    sh 'pip install -r requirements.txt'
                    sh 'pytest --cov=. --cov-fail-under=80'
                }
            }
        }
        stage('Docker Build & Package') {
            steps {
                sh 'docker compose build'
            }
        }
    }
    post {
        always {
            echo 'MentorLink Jenkins pipeline finished.'
        }
    }
}
