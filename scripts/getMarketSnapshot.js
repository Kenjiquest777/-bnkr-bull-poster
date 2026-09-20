// Server script to pull live DEX metrics for BNKR, LFI, and DRB
const addrs = {
  BNKR: '0x22af33fe49fd1fa80c7149773dde5890d3c76f3b',
  LFI: '0x3722264ab15a1dfce5a5af89e6547f7949a8aba3',
  DRB: '0x3ec2156d4c0a9cbdab4a016633b7bcf6a8d68ea2'
};

const url = 'https://api.dexscreener.com/latest/dex/tokens/' + Object.values(addrs).join(',');
const res = await http.fetch(url);
const pairs = (res && Array.isArray(res.pairs)) ? res.pairs : [];

const result = {};

for (const [sym, addr] of Object.entries(addrs)) {
  const tokenPairs = pairs.filter(p => p.baseToken && p.baseToken.address && p.baseToken.address.toLowerCase() === addr.toLowerCase());
  tokenPairs.sort((a, b) => ((b.volume && b.volume.h24) || 0) - ((a.volume && a.volume.h24) || 0));
  const main = tokenPairs[0] || {};
  
  result[sym] = {
    symbol: sym,
    name: main.baseToken ? main.baseToken.name : sym,
    address: addr,
    priceUsd: parseFloat(main.priceUsd || '0'),
    change24h: (main.priceChange && typeof main.priceChange.h24 === 'number') ? main.priceChange.h24 : 0,
    change6h: (main.priceChange && typeof main.priceChange.h6 === 'number') ? main.priceChange.h6 : 0,
    change1h: (main.priceChange && typeof main.priceChange.h1 === 'number') ? main.priceChange.h1 : 0,
    volume24h: (main.volume && main.volume.h24) || 0,
    fdv: main.fdv || 0,
    buys24h: (main.txns && main.txns.h24 && main.txns.h24.buys) || 0,
    sells24h: (main.txns && main.txns.h24 && main.txns.h24.sells) || 0,
    pairUrl: main.url || ('https://dexscreener.com/base/' + addr)
  };
}

return {
  timestamp: Date.now(),
  tokens: result
};
