node {
	git 'https://github.com/EricRabil/BBDash'
	
	def build_env

	stage("Setup Docker") {
		build_env = docker.build('bbdash:build', '.')
	}

	build_env.inside("-u root") {
		stage("Compile Support Libraries") {
			sh 'cd /tmp/bbdash && yarn ts:build'
		}

		stage("Compile React") {
			sh 'cd /tmp/bbdash && yarn app:build'
		}

		stage("Compile CRX") {
			sh 'cd /tmp/bbdash && yarn crx:build'
		}
		
		stage("Archive Artifacts") {
			sh "mv /tmp/bbdash/packages/chrome-extension/dist ${WORKSPACE}/bbdash-intermediate"
			sh '''
			cd /tmp/bbdash/packages/chrome-extension/dist
			zip -r ../bbdash-${BUILD_NUMBER}-development.zip *
			cd ../
			rm -rf ${WORKSPACE}/*.zip
			mv *.zip ${WORKSPACE}/
			'''
			archiveArtifacts artifacts '*.zip'
		}
	}
}