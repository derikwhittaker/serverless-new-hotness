const gulp = require('gulp');
const run = require('gulp-run');
const zip = require('gulp-zip');
const log = require('fancy-log');
const clean = require('gulp-clean');
const runSequence = require('run-sequence');
const merge = require('merge-stream');

const options = {
    stagingBuildFolder: "build_staging",
    buildFolder: 'build'
};

const environments = {
    active: "nonprod",
    nonprod: {
        lambdaName: "serverless-hotness-demo",
        lambdaPackageName: "serverless-new-hotness.zip",
        dropBucketName: "serverless-drop-bucket"
    }
}

gulp.task('package-for-deploy', function (done) {

    runSequence(
        'clean-build-folders',
        ['babel-code', 'copy-needed-files'],
        'package-node',
        'clean-build-folders',
        done);
});

gulp.task('deploy', function (done) {

    runSequence(
        'package-for-deploy',
        'deploy-to-s3',
        'deploy-to-lambda',
        done);
});

gulp.task('deploy-to-lambda', deployToLambda);
gulp.task('deploy-to-s3', deployToS3Bucket);

gulp.task('babel-code', babelCode);
gulp.task('copy-needed-files', copyNeededFiles);
gulp.task('package-node', packageNode);
gulp.task('clean-build-folders', cleanBuildFolders);
gulp.task('aws-credentials', awsCredentials);

function babelCode() {
    log.info("Attmpeting to Transpile code");

    return run(`babel $(find src -type f \\( -iname "*.js" ! -path "*node_modules*" ! -iname "*.spec.js" \\) && ls src/index.js) --out-dir ${options.stagingBuildFolder} --compact --no-comments`).exec();
}

function copyNeededFiles() {
    log.info("Attmpeting to Copy Needed Files");

    // We do NOT want to copy node_modules here, just kills time
    const filesToCopy = [
        '__mocks__/**/*'
    ]

    return gulp.src(filesToCopy, { base: "./" })
        .pipe(gulp.dest(options.stagingBuildFolder));
}

function packageNode() {
    log.info("Attmpeting to build Lambda")

    const stagingBuildFolder = options.stagingBuildFolder;
    const buildFolder = options.buildFolder;
    const lambdaPackageName = environments[environments.active].lambdaPackageName

    // We can copy the node_modules from its normal location which will speed things up.
    const nodeModules = gulp.src(['node_modules/**', '!node_modules/**/*.md',], { base: '.' });
    const sourceFiles = gulp.src([`${stagingBuildFolder}/**/*`]);

    return merge(nodeModules, sourceFiles)
        .pipe(zip(lambdaPackageName))
        .pipe(gulp.dest(buildFolder));

}

function cleanBuildFolders() {
    log.info("Attempting to remove the lambda build folder")

    return gulp.src([options.stagingBuildFolder])
        .pipe(clean({ read: false }));
}

function awsCredentials() {
    const cmd = `aws configure --profile `;

    log.info(`Setting Credentials Files:`);
    log.info(`CMD -> ${cmd}`);

    return run(cmd).exec();
}

function deployToLambda() {
    const lambdaPackageName = environments[environments.active].lambdaPackageName;
    const lambdaName = environments[environments.active].lambdaName;
    const s3BucketName = environments[environments.active].dropBucketName;

    const cmd = `aws lambda update-function-code --region us-east-1 \
                --no-verify-ssl \
                --function-name ${lambdaName} \
                --s3-bucket ${s3BucketName} \
                --s3-key ${lambdaPackageName}`;

    log.info(`Deploy To Lambda:`);
    log.info(`CMD -> ${cmd}`);

    return run(cmd).exec();
}

function deployToS3Bucket() {
    const lambdaPackageName = environments[environments.active].lambdaPackageName;
    const packageNameAndLocation = `./${options.buildFolder}/${lambdaPackageName}`;
    const s3BucketPath = "s3://" + environments[environments.active].dropBucketName;

    const cmd = `aws s3 cp \
                --no-verify-ssl \
                ${packageNameAndLocation} \
                ${s3BucketPath}`;

    log.info(`Deploy To S3 Bucket:`);
    log.info(`Copying package ' ${packageNameAndLocation}' to ${s3BucketPath}`);
    log.info(`CMD -> ${cmd}`);

    return run(cmd).exec();
}

