const axios = require('axios');
let pg = require('pg');
let dbString = 'tcp://user:postgre@localhost:5432/test-db';

const genesisBlockParentHash = 'e58f33f9baf9305dc6f82b9f1934ea8f0ade2defb951258d50167028c780351f'
const APIprefix = 'https://api.trongrid.io/wallet/'


pg.connect(dbString, function(err, client, done) {

        client.query(
            'INSERT INTO transactions (block_id, параметры транзакции) VALUES($1, $2, $3) RETURNING id', 
            ['title', 'long... body...', new Date()], 
            function(err, result) {
                if (err) {
                    console.log(err);
                } else {
                    console.log('row inserted with id: ' + result.rows[0].id);
                }
                client.end();
        });       
    
});

////
function getNowBlock(){

    axios.post(`${APIprefix}getnowblock`)
    .then(function (response) {
        // handle success
        
        if ( response.status === 200 ) {
            let data = response.data
            console.log( data.blockID );
            console.dir( data.block_header );
            console.dir( data.block_header.number );
        }
        
    })
    .catch(function (error) {
        // Without handling
        console.log(error);
    })
}


  // Берем текущий номер блока в базе 
  // и берем последний номер 

  function getBlockbyNum(num){
    axios.post(`${APIprefix}getblockbynum`, {"num" : num})
    .then(function (response) {
      // handle success
      
      if ( response.status === 200 ) {
          let data = response.data
          console.log(  data.blockID);
          console.log( data.block_header );
          console.log( data.block_header.raw_data.number );
      }
      
    })
    .catch(function (error) {
      // Without handling
      console.log(error);
    })
  }


  getBlockbyNum(0);

  //getCurNumBlockFromDB();