node {
    env.NODEJS_HOME = "${tool 'Node 14.x'}"
    env.PATH="${env.NODEJS_HOME}/bin:${env.PATH}"

    stage("Yarn") {
        sh 'yarn'
    }

    stage("Compile Support Libraries") {
        sh 'yarn ts:build'
    }

    stage("Compile React") {
        sh 'yarn app:build'
    }

    stage("Compile CRX") {
        sh 'yarn crx:build'
    }

    stage("Archive Artifacts") {
        dir("packages/chrome-extension") {
            dir("dist") {
                sh "zip -r ../bbdash-${BUILD_NUMBER}-development.zip *"
            }

            archiveArtifacts artifacts: "bbdash-${BUILD_NUMBER}-development.zip"
        }
    }
}