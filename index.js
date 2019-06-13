const crypto = require("crypto");
const fs = require("fs");
const getSourceData=async (sourceFilepath)=>{

        let arrData=[];

        return new Promise((resolve,reject)=>{

            var LineByLineReader = require("line-by-line"),
            lr = new LineByLineReader(sourceFilepath);

            lr.on("error", function(err) {
            // 'err' contains error object
            });

            lr.on("line", function(line) {
            // pause emitting of lines...

            arrData.push(line.split(',')[0].replace("'",""));

            });

            lr.on("end", function() {
            // All lines are read, file is closed now.
            resolve(arrData);
            });

        })

}

const runMatcher=async (srcData)=>{
let srcHashData=[];
    srcData.map((item,idx)=>{
        let hash = crypto
        .createHash("md5")
        .update("0" + item)
        .digest("hex");
        srcHashData[hash.toUpperCase()]="0" + item;
    })

     

  //  process.exit();

    const compareHash=(hashLine,lineNo)=>{
        //check the data exists
     // let finalHash=hashLine.toUpperCase();
     // console.log(lineNo);
       //let matches= srcHashData.filter(sdHash=> sdHash==hashLine.toUpperCase() );
     //  console.log(`Checking Phone against ${hashLine} : Line ${lineNo}`);
       let phoneNumber=undefined;
       //if(matches.length>0 && lineNo > 2){
         
       //  let srcDataIndex=srcHashData.indexOf(finalHash);
        // phoneNumber=srcData[srcDataIndex];
      let srcDataIndex=-1;

        if(srcHashData[hashLine]){
              phoneNumber=srcHashData[hashLine];
               srcDataIndex=1;

        }
        //let srcDataIndex=
         if(phoneNumber)
            console.log("Match found Line :" + phoneNumber + "->"  + parseInt(srcDataIndex+1) + ":" + hashLine + "->" + lineNo);
       //}
       return Promise.resolve({count:srcDataIndex>=0,phone:phoneNumber});
     }

    return new Promise(async (resolve,reject)=>{
        let resp=await verifyHashExists("./dataset/md5set.txt",compareHash);
        
        resolve(resp);

    });


}

const verifyHashExists = (md5HashSourceFilePath, comparer) => {

return new Promise((resolve,reject)=>{

    let hashMatches=[];
    let lineCtr=0;
  var LineByLineReader = require("line-by-line"),
    lr = new LineByLineReader(md5HashSourceFilePath);

  lr.on("error", function(err) {
    // 'err' contains error object
  });

  lr.on("line", function(hashLine) {
    // pause emitting of lines...
    //lr.pause();
      lineCtr++;
      console.log(lineCtr);
     comparer(hashLine,lineCtr).then(p => {
      if(p.count>0){
        hashMatches.push(p);
      }
     
    }); 
    //  if(lineCtr>300){
      //   resolve(hashMatches);
//}
       
  });

  lr.on("end", function() {
    // All lines are read, file is closed now.
    resolve(hashMatches);
  });

})

};


(async ()=>{

let srcData=await getSourceData("./dataset/Perth Data-Landline.csv");
let resp=await runMatcher(srcData);
fs.writeFile('result.txt', JSON.stringify(resp), 'utf8', function(){ console.log("Result saved"); process.exit();});

})();