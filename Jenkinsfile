pipeline {
	agent {
		dockerfile {
			filename 'Dockerfile'
			customWorkspace '/var/bbdash'
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
