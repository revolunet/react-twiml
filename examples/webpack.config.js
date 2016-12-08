 module.exports = {
     entry: './examples/server.js',
     target: 'async-node',
     output: {
         path: './dist-examples',
         filename: 'index.js',
     },
     module: {
         loaders: [{
             test: /\.jsx?$/,
             exclude: /node_modules/,
             loader: 'babel'
         },{
             test: /\.json$/,
             loader: 'json'
         }]
     }
 }