node {
	git 'https://github.com/EricRabil/BBDash'
	
	def build_env = docker.build('bbdash:build', '.')

	stage('Build') {
		build_env.inside {
			sh 'cd /tmp/bbdash/build && yarn build'
		}
	}

	stage('Archive') {
		build_env.inside {
			archiveArtifacts artifacts: '/tmp/bbdash/build/**'
		}
	}
}