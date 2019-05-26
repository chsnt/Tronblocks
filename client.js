const axios = require('axios');
let pg = require('pg');

//const genesisBlockParentHash = 'e58f33f9baf9305dc6f82b9f1934ea8f0ade2defb951258d50167028c780351f'
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


  function getBlockbyNum(num){
    return axios.post(`${APIprefix}getblockbynum`, {"num" : num})
  }
  
  //
  let run = async (err, client, release) => {
   
    let lastBlock = await getLastBlock();

    return new Promise((resolve, reject) => {

        let num = lastBlock.number;

        num = 350;

        let timer = setInterval(function() {
            getBlockbyNum(num)
            .then(function (response) {
                // handle success

                  let data = response.data.block_header; 

                  console.log(response.data.transactions);

                  client.query(
                    `INSERT 
                     INTO blocks 
                        (block_number, tx_trie_root, witness_address, parent_hash, timestamp, witness_signature, transactions) 
                    VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id`, 
                    [ data.raw_data.number                // block_number
                     ,data.raw_data.txTrieRoot            // tx_trie_root
                     ,data.raw_data.witness_address       // witness_address
                     ,data.raw_data.parentHash            // parent_hash
                     ,data.raw_data.timestamp             // timestamp
                     ,data.witness_signature              // witness_signature
                     ,JSON.stringify(response.data.transactions)   // transactions
                    ], 
                    
                    function(err, result) {
                        release()
                        if (err) {
                            console.error('Error executing query', err.stack)
                        } else {                       
                            
                            if ( num === 0 ) { clearInterval(timer); resolve('Ok'); }
                            num--;

                        }

                    }); 

              })
              .catch(function (error) {
                // Without handling
                console.log(error);
              })
 
        }, 100);   // without Interval - out of memory

    });

  }    

