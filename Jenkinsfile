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
				sh 'node scripts/unstash_node_modules.js'
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
