pipeline {
	agent {
		dockerfile {
			filename 'Dockerfile'
			args '-u root'
		}
	}
	stages {
		stage('Build') {
			steps {
				sh 'yarn build'
			}
		}
	}
}
