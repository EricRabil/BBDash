pipeline {
	agent {
		dockerfile {
			filename 'Dockerfile'
			customWorkspace '/var/jenkins_home/workspace/BBDash_master'
			args '-u root'
		}
	}
	stages {
		stage('Build') {
			steps {
				sh 'yarn build'
			}
		}
		stage('Archive') {
			steps {
				dir('build') {
					archiveArtifacts artifacts: '**'
				}
			}
		}
	}
}
