pipeline {
	agent {
		dockerfile true
	}
	stages {
		stage('Build') {
			steps {
				sh 'yarn build'
			}
		}
	}
}
