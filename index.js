"use strict";
const ethers = require("ethers");
const abi = require("./abi/ABI.json");
const BigNumber = require("bignumber.js");
const https = require("https");
const log4js = require("log4js");
const config = require("./conf/conf.js");
const sdk = require("@defillama/sdk");
const moment = require("moment");

log4js.configure(config.log4jsConfig);
const logger = log4js.getLogger("Defistation's Data Provider");
logger.info("Defistation's Data Provider start.");

async function gettvl() {
  const DAOvault = {
    Elon: "0x2D9a136cF87D599628BCBDfB6C4fe75Acd2A0aA8",
    Cuban: "0x2AD9F8d4c24652Ea9F8A954F7E1FdB50a3bE1DFD",
    Citadel: "0x8fE826cC1225B03Aa06477Ad5AF745aEd5FE7066",
    FAANG: "0x9ee54014e1E6CF10fD7E9290FdB6101fd0d5D416",
    Metaverse: "0x5b3ae8b672a753906b1592d44741f71fbd05ba8c",
    CitadelV2: "0x3845d7c09374df1ae6ce4728c99dd20d3d75f414",
    //MoneyPrinter: "0x3DB93e95c9881BC7D9f2C845ce12e97130Ebf5f2",
  };
  const timestamp = moment().unix();
  let block = await sdk.api.util.lookupBlock(timestamp);

  let [ElonTVL, CubanTVL, CitadelTVL, FAANGTVL, MetaverseTVL, CitadelV2TVL] =
    await Promise.all([
      sdk.api.abi.call({
        target: DAOvault.Elon, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),

      sdk.api.abi.call({
        target: DAOvault.Cuban, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),
      sdk.api.abi.call({
        target: DAOvault.Citadel, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),

      sdk.api.abi.call({
        target: DAOvault.FAANG, // contract address
        abi: abi.getTotalValueInPool, // erc20:methodName
        block: block[block], // Current block number
      }),

      sdk.api.abi.call({
        target: DAOvault.Metaverse, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),
      sdk.api.abi.call({
        target: DAOvault.CitadelV2, // contract address
        abi: abi.getAllPoolInUSD, // erc20:methodName
        block: block[block], // Current block number
      }),
    ]);
  ElonTVL = parseInt(ElonTVL.output) / 10 ** 6;
  CitadelTVL = parseInt(CitadelTVL.output) / 10 ** 6;
  CubanTVL = parseInt(CubanTVL.output) / 10 ** 6;
  MetaverseTVL = parseInt(MetaverseTVL.output) / 10 ** 18;
  FAANGTVL = parseInt(FAANGTVL.output) / 10 ** 18;
  CitadelV2TVL = parseInt(CitadelV2TVL.output) / 10 ** 18;

  let tvl =
    ElonTVL + CitadelTVL + CubanTVL + MetaverseTVL + FAANGTVL + CitadelV2TVL;
  tvl = tvl.toFixed(2);
  console.log(tvl);

  let body = {
    tvl: tvl,
    volume: 0,
    bnb: 0,
    data: {
      vaults: [
        {
          id: "0x2D9a136cF87D599628BCBDfB6C4fe75Acd2A0aA8",
          name: "Elon",
        },
        {
          id: "0x2AD9F8d4c24652Ea9F8A954F7E1FdB50a3bE1DFD",
          name: "Cuban",
        },
        {
          id: "0x8fE826cC1225B03Aa06477Ad5AF745aEd5FE7066",
          name: "Citadel",
        },
        {
          id: "0x9ee54014e1E6CF10fD7E9290FdB6101fd0d5D416",
          name: "FAANG",
        },
        {
          id: "0x5b3ae8b672a753906b1592d44741f71fbd05ba8c",
          name: "Metaverse",
        },
        {
          id: "0x3845d7c09374df1ae6ce4728c99dd20d3d75f414",
          name: "CitadelV2",
        },
      ],
    },
    test: false,
  };
  let clientId = config.default.clientId;
  let clientSecret = config.default.key;
  let auth =
    "Basic " + Buffer.from(clientId + ":" + clientSecret).toString("base64");
  let bodyStr = JSON.stringify(body);
  logger.info(bodyStr);
  let headers = {
    // 'Host': 'www.example.com',
    Authorization: auth,
    "Content-Type": "application/json",
    "Content-Length": bodyStr.length,
  };
  let options = {
    host: "api.defistation.io",
    port: 443,
    path: "/dataProvider/tvl",
    method: "POST",
    headers: headers,
  };
  let req = https.request(options, (res) => {
    logger.info(`STATUS: ${res.statusCode}`);
    logger.info(`HEADERS: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    res.on("data", (chunk) => {
      logger.info(`BODY: ${chunk}`);
    });
    res.on("end", () => {
      logger.info("No more data in response.");
    });
  });

  req.on("error", (e) => {
    logger.error(`problem with request: ${e.message}`);
  });

  // write data to request body
  req.write(bodyStr);
  req.end();
}

gettvl();
