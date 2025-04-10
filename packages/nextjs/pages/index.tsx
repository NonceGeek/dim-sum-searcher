import { SetStateAction, useEffect, useRef, useState } from "react";
import { NextPage } from "next";
// import { type } from "os";
import ReactMarkdown from "react-markdown";
import { parseEther } from "viem";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

//定义一个新的数据类型来记录后端返回的数据
export type resultByDataset = {
  dataset_id: string;
  results: search_result[];
};
//定义一个数据类型来记录每个搜索结果
export type search_result = {
  id: string;
  data: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  metadata: {};
  note?: string;
  category?: string;
};

function timeout(delay: number) {
  return new Promise(res => setTimeout(res, delay));
}

const ETHSpace: NextPage = () => {
  //在对后端发起求后，将response的内容保存在results中
  //如果用户选择使用mixed模式，则使用resultByDataset来记录结果
  const [res, setRes] = useState<resultByDataset[]>([]);
  //设置默认是在我们提供的数据集而不是公共数据集中查询
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [datasetList, _setDatasetList] = useState(false);
  //获取目前提供的数据集选项
  const [options, setOptions] = useState<string[]>([]);
  // const [itemId, setItemId] = useState<number>();
  //获取用户选择的数据集
  const [dataset, setDataset] = useState("mixed");
  //获取用户搜索的prompt
  const [searchPrompt, setSearchPrompt] = useState("");
  //仅在组件挂载时执行一次获取数据集列表

  // Ref to attach to the audio element

  useEffect(() => {
    setOptions(["全局搜索", "粤语词典"]);
  }, []);

  // const { data: totalCounter } = useScaffoldContractRead({
  //   contractName: "vectorTagger",
  //   functionName: "vectorName",
  //   args: [],
  // });

  // new feature
  const handleEnterPress = (event: { key: string }) => {
    if (event.key === "Enter") {
      console.log("Enter Enter Key! ");
      handleonClick();
    }
    // TODO: maybe set an EGG here.
  };

  // Ref to attach to the audio element
  const audioRef = useRef(null);

  // State to manage playing state
  const [isPlaying, setIsPlaying] = useState(false);

  const [assetId, setAssetId] = useState(0);
  const { writeAsync, isLoading, isMining } = useScaffoldContractWrite({
    contractName: "vectorTagger",
    functionName: "tagItem",
    args: [assetId, JSON.stringify({ like: true })],
    value: parseEther("0"),
    blockConfirmations: 1,
    onBlockConfirmation: txnReceipt => {
      console.log("Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const likeAsset = (assetId: SetStateAction<number>) => {
    setAssetId(assetId);
    writeAsync();
  };
  // Function to toggle music play/pause
  const togglePlayPause = () => {
    const prevValue = isPlaying;
    setIsPlaying(!prevValue);
    if (!prevValue) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };

  const handleonClick = async () => {
    console.log("searchPrompt: " + searchPrompt);

    // Determine the URL based on the selected dataset
    let url;
    if (dataset === "bodhi-imgs") {
      url = new URL("https://bodhi-data.deno.dev/img_search");
    } else {
      url = new URL("https://bodhi-data.deno.dev/text_search_v2");
      url.searchParams.append("table_name", "cantonese_corpus_all"); // assuming the table name
      url.searchParams.append("column", "data"); // assuming you are searching in 'content' column
    }

    // Append the keyword to the URL
    url.searchParams.append("keyword", searchPrompt);

    try {
      const res = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      console.log("data: ", data);

      setRes(data); // Assuming setRes is the function to update your component state
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };
  return (
    <div className="grid lg:grid-cols-2 flex-grow">
      <div className="hero min-h-screen bg-base-200 bg-gradient-to-r from-green-500 to-blue-500">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-2xl font-bold">🔎🤠 Dim Sum Search Engine</h1>

            <p className="py-6 text-sm">
              -- Facing Cantonse Corpus, Search & Tag Items based on AI & Web3 <br></br> -- 面向粤语语料，基于 AI
              与区块链的检索与标注{" "}
            </p>
            <div className="join mb-6">
              <div>
                <div>
                  <input
                    style={{ width: "300px" }}
                    className="input input-bordered join-item"
                    value={searchPrompt}
                    onChange={e => {
                      setSearchPrompt(e.target.value);
                    }}
                    onKeyDown={handleEnterPress}
                    placeholder="Enter your prompt to search"
                  />
                </div>
              </div>
              <div>
                <div>
                  {!datasetList ? (
                    <select
                      className="select select-bordered join-item"
                      onChange={e => {
                        setDataset(e.target.value);
                      }}
                    >
                      {options.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="input input-bordered join-item"
                      value={dataset}
                      onChange={e => {
                        setDataset(e.target.value);
                      }}
                      placeholder="Pls input the public dataset name"
                    />
                  )}
                </div>
              </div>
              <div className="indicator">
                <button
                  className="btn join-item"
                  onClick={() => {
                    handleonClick();
                  }}
                >
                  🔎 Search
                </button>
              </div>
            </div>
            <div className="hero-content text-left">
              <span className="text-sm">
                <p>
                  <b>Some search question examples: </b>
                </p>
                <p>* 淡淡交會過</p>
                <p>* 故乡</p>
                <p>* 好</p>
              </span>
            </div>
            <a href="https://bodhi.wtf/10586" target="_blank" rel="noreferrer">
              <button className="w-96 bg-white hover:bg-gray-100 text-gray-800 py-2 px-5 border border-gray-400 rounded shadow">
                🤑 <b>Buy</b> shares to support explorer!
              </button>
            </a>
            <br></br>
            <a href="https://bodhi.wtf/13663" target="_blank" rel="noreferrer">
              <button className="w-96 bg-white hover:bg-gray-100 text-gray-800 py-2 px-5 border border-gray-400 rounded shadow">
                📝 Blog for Explorer<b>(See the future plan)</b>
              </button>
            </a>
            <br></br>
            <a href="https://random-hacker.deno.dev/" target="_blank" rel="noreferrer">
              <button className="w-96 bg-white hover:bg-gray-100 text-gray-800 py-2 px-5 border border-gray-400 rounded shadow">
                🎲 A Random <b>Cantonese</b>
              </button>
            </a>
            <br></br>
            <a href="https://twitter.com/0xleeduckgo" target="_blank" rel="noreferrer">
              <button className="w-96 bg-white hover:bg-gray-100 text-gray-800 py-2 px-5 border border-gray-400 rounded shadow">
                ❤️ Follow us! ❤️
              </button>
            </a>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-r from-blue-500 to-green-500">
        <div className="mx-auto w-4/5 max-h-[600px] backdrop-blur-lg backdrop-filter p-10 m-10 rounded-lg opacity-80 shadow-md overflow-auto overflow-y-auto">
          <h2 className="text-4xl font-bold mb-1">Search Results</h2>
          <div className="collapse-title text-primary-content peer-checked:bg-secondary peer-checked:text-secondary-content">
            Results from &ldquo;语料库全局&rdquo;
          </div>
          <div>
            {res.length > 0 ? (
              res.map((data, datasetIndex) => (
                <div key={datasetIndex} className="mb-6">
                  <h3 className="text-xl font-bold"> 语料：{data.data} </h3>
                  <a href="https://www.yueyumao.com/" target="_blank" rel="noreferrer" className="inline-block ml-2 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors">如何发音？</a>
                  <p>类别：{data.category}</p>
                  {/* TODO: data.note will be note":[{"context":{"pron":"ding6","work class":"d"},"contributor":"0x0"}], to show it with markdown format. */}
                  {data.note ? (
                    <div className="mt-2 p-3 bg-white bg-opacity-20 rounded-md">
                      <h4 className="font-semibold mb-1">Notes:</h4>
                      {data.note.map((noteItem, noteIndex) => (
                        <div key={noteIndex} className="mb-2 p-2 bg-white bg-opacity-10 rounded">
                          <ReactMarkdown className="prose prose-sm">
                            {`**Context**: \n\n${Object.entries(noteItem.context || {})
                              .map(([key, value]) => `\\* **${key}**: ${value}`)
                              .join('\n\n')}\n\n**Contributor:** ${noteItem.contributor || "Anonymous"}`}
                          </ReactMarkdown>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-xl">No results found. Try a different search query.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ETHSpace;
