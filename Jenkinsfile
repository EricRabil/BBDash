pipeline {
	agent { dockerfile true }
	stages {
		stage('Build') {
			steps {
				dir(path: '/var/bbdash') {
					sh 'yarn build'
				}
			}
		}
	}
}
