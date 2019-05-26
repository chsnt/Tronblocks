const axios = require('axios');
let pg = require('pg');
let dbString = 'tcp://user:postgre@localhost:5432/test-db';

const genesisBlockParentHash = 'e58f33f9baf9305dc6f82b9f1934ea8f0ade2defb951258d50167028c780351f'
const APIprefix = 'https://api.trongrid.io/wallet/'

const config = {
    user: 'postgres',
    database: 'postgres',
    //password: 
    port: 5432
};

const pool = new pg.Pool(config);

pool.connect(function (err, client, release) {

    if (err) {
        console.log("Can not connect to the DB" + err);
    } else {
        run(err, client, release).then( () => {console.log('there999'); pool.end().then(() => console.log('pool has ended')) } );
    }

})


/* pg.connect(dbString, function(err, client, done) {

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
}); */


////
async function getLastBlock(){

    return axios.post(`${APIprefix}getnowblock`)
    .then(function (response) {

        let data = response.data.block_header.raw_data; 
        let returnObj = { 
            "number"   : data.number, 
            "parentHash" : data.parentHash
        }
        return returnObj;
        
    })
    .catch(function (error) {
        console.log('there3')
        console.log(error);
    })
}

   //
 /*   let run = async () => {
        let blockInfo = await getLastBlock();
        console.dir(blockInfo);  
   } */
    
   //run ();


  // Берем текущий номер блока в базе 
  // и берем последний номер 

  function getBlockbyNum(num){

    return axios.post(`${APIprefix}getblockbynum`, {"num" : num})

  }

  //
  function firstRequest() {

    return axios.post(`${APIprefix}getblockbynum`, {"num" : num})(

               //здесь формируем запрос из requestData
               ).then(response => response.json()).then(result => {

               if(result.isFinal) return result;            // тут условие
               return recursiveRequest(result.nextRequest); // вызываем следующий запрос

               });
  }

  //
  function recursiveRequest(requestData) {

    return axios.post(`${APIprefix}getblockbynum`, {"num" : num})(

               //здесь формируем запрос из requestData
               ).then(response => response.json()).then(result => {

               if(result.isFinal) return result;            // тут условие
               return recursiveRequest(result.nextRequest); // вызываем следующий запрос

               });

  }
  
/*   recursiveRequest({}).then(finalResult => {
    //работаем с последним результатом
  }); */

  //getCurNumBlockFromDB();

  let run = async (err, client, release) => {
   
    let lastBlock = await getLastBlock();

    return new Promise((resolve, reject) => {

        //console.log(lastBlock.number)
        let num = lastBlock.number;
        //for ( let num = lastBlock.number; num >= 0 ; num-- ) {
        //for ( let num = 100; num >= 0 ; num-- ) {
        num = 350;

        let timer = setInterval(function() {
            getBlockbyNum(num)
            .then(function (response) {
                // handle success

                  let data = response.data.block_header; 

                  //console.log( response.data.block_header.raw_data.number )       
                  console.log( response.data.block_header )   
                  
                  console.log('there1')
                  
                  client.query(
                    `INSERT 
                     INTO blocks 
                        (block_number, tx_trie_root, witness_address, parent_hash, timestamp, witness_signature, transactions) 
                    VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`, 
                    [ data.raw_data.number                // block_number
                     //,response.data.block_header          // block_id
                     ,data.raw_data.txTrieRoot            // tx_trie_root
                     ,data.raw_data.witness_address       // witness_address
                     ,data.raw_data.parent_hash           // parent_hash
                     ,data.raw_data.timestamp             // timestamp
                     ,data.witness_signature              // witness_signature
                     ,JSON.stringify(data.transactions)   // transactions
                    ], 
                    
                    function(err, result) {
                        release()
                        if (err) {
                            console.error('Error executing query', err.stack)
                        } else {                         
                            
                            if ( num === 0 ) { clearInterval(timer); resolve('Ok'); }
                            num--;
                            //console.log('row inserted with id: ' + result.rows[0].id);
                        }
                        //pool.end();
                        //pool.done();
                    }); 



              })
              .catch(function (error) {
                // Without handling
                console.log(error);
              })


 
        }, 100);   // without Interval - out of memory


    });

  }    



/*   getBlockbyNum(1)
  .then(function (response) {
    // handle success
      //console.log( response.data.block_header.raw_data.number )       
      console.log( response.data )       
  })
  .catch(function (error) {
    // Without handling
    console.log(error);
  })

  getBlockbyNum(342)
  .then(function (response) {
    // handle success
      //console.log( response.data.block_header.raw_data.number )       
      console.log( response.data )       
  })
  .catch(function (error) {
    // Without handling
    console.log(error);
  }) */