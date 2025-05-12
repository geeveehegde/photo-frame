import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Custom plugin to create zip file after webpack build and handle file operations
class PostBuildPlugin {
  apply(compiler) {
    compiler.hooks.afterEmit.tap('PostBuildPlugin', (compilation) => {
      // First, we need to make a temporary copy of photoframe.js at the root level
      const sourceFile = path.resolve(__dirname, 'dist/photoframe.js');
      const tempFile = path.resolve(__dirname, 'photoframe.js');
      const tempPackageFile = path.resolve(__dirname, 'package.temp.json');
      
      try {
        // Copy photoframe.js to root temporarily for zip
        fs.copyFileSync(sourceFile, tempFile);
        
        // Create a simplified package.json without devDependencies and type:module
        const packageJson = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8'));
        delete packageJson.devDependencies;
        // Make sure type:module is not present
        delete packageJson.type;
        
        // Write the simplified package.json to a temp file
        fs.writeFileSync(tempPackageFile, JSON.stringify(packageJson, null, 2), 'utf8');
        
        // First remove any existing zip file
        const removeOldZip = 'rm -f photoframev1.0.0.zip';
        
        exec(removeOldZip, (removeError) => {
          if (removeError) {
            console.error(`Error removing old zip file: ${removeError}`);
            return;
          }
          
          // Create a new clean zip file with exactly what we want
          // Using a temporary directory to ensure proper naming in the zip
          const zipSteps = `
            mkdir -p temp_for_zip
            cp ${tempFile} temp_for_zip/photoframe.js
            cp ${tempPackageFile} temp_for_zip/package.json
            cd temp_for_zip
            zip -j ../photoframev1.0.0.zip photoframe.js package.json
            cd ..
            zip -r photoframev1.0.0.zip scripts autostart
            rm -rf temp_for_zip
          `;
          
          exec(zipSteps, (zipError, stdout, stderr) => {
            if (zipError) {
              console.error(`Error creating zip file: ${zipError}`);
              return;
            }
            
            console.log('Successfully created photoframev1.0.0.zip');
            
            // Clean up: remove dist folder and temp files
            const rmCommand = 'rm -rf dist package.temp.json';
            exec(rmCommand, (rmError) => {
              if (rmError) {
                console.error(`Error removing temporary files: ${rmError}`);
              } else {
                console.log('Successfully removed temporary files');
              }
              
              // Remove the temporary photoframe.js from root
              try {
                fs.unlinkSync(tempFile);
                console.log('Successfully removed temporary photoframe.js file');
              } catch (unlinkError) {
                console.error(`Error removing photoframe.js: ${unlinkError}`);
              }
            });
          });
        });
      } catch (fsError) {
        console.error(`Error handling files: ${fsError}`);
      }
    });
  }
}

export default {
  mode: 'production',
  entry: './main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'photoframe.js',
    // Add this to ensure compatibility with ES modules
    libraryTarget: 'commonjs2',
  },
  target: 'node',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {
                targets: {
                  node: 'current'
                },
                modules: 'commonjs'
              }]
            ]
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
  },
  // Exclude assets and playlist folders from being processed
  externals: [
    function(context, request, callback) {
      // If the request includes assets or playlist directories, mark as external
      if (request.includes('assets/') || request.includes('playlist/')) {
        return callback(null, 'commonjs ' + request);
      }
      callback();
    }
  ],
  plugins: [
    new PostBuildPlugin()
  ]
};