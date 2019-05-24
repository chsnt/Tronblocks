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

pool.connect(function (err, client, done) {

    if (err) {
        console.log("Can not connect to the DB" + err);
    } else {

        run();

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
    .then(function (response) {
      // handle success
        console.log( response.data.block_header.raw_data.number )       
      
    })
    .catch(function (error) {
      // Without handling
      console.log(error);
    })
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

  let run = async () => {
   
    let lastBlock = await getLastBlock();

    return new Promise((resolve, reject) => {

        //console.log(lastBlock.number)
        let num = lastBlock.number;
        //for ( let num = lastBlock.number; num >= 0 ; num-- ) {
        //for ( let num = 100; num >= 0 ; num-- ) {
        //num = 5;

        let timer = setInterval(function() {
            getBlockbyNum(num);
            num--;
            if ( num === 0 ) { clearInterval(timer); }
        }, 1000);   // without Interval - out of memory


    });

  }    



  //getBlockbyNum(1);