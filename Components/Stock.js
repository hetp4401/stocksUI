import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { av_key } from "../config";
import Chart from "./Chart";

const Parser = require("fast-html-parser");

const Stock = ({ route, navigation }) => {
  const { ticker, name } = route.params.x;

  const [slables, setslables] = useState([""]);
  const [prices, setprices] = useState([0]);
  const [price, setprice] = useState("");
  const [high, sethigh] = useState("");
  const [low, setlow] = useState("");
  const [volume, setvolume] = useState("");
  const [change, setchange] = useState("");

  const [links, setlinks] = useState([]);

  const get_intraday = (interval) => {
    fetch(
      "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" +
        ticker +
        "&interval=" +
        interval +
        "min&apikey=" +
        av_key
    )
      .then((res) => res.json())
      .then((resJson) => {
        const raw_data = resJson["Time Series (" + interval + "min)"];
        const processed_data = [];
        const label_data = [];
        var counter = 1;
        for (const obj in raw_data) {
          const price = raw_data[obj];
          processed_data.unshift(parseFloat(price["1. open"]));
          label_data.unshift(
            counter % 20 == 0 || counter == 1 ? obj.substr(-8, 5) : ""
          );
          counter += 1;
        }
        setprices(processed_data);
        setslables(label_data);
      });
  };

  const get_quote = () => {
    fetch(
      "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" +
        ticker +
        "&apikey=" +
        av_key
    )
      .then((res) => res.json())
      .then((resJson) => {
        const data = resJson["Global Quote"];
        const vals = Object.values(data);
        setprice(vals[4]);
        sethigh(vals[2]);
        setlow(vals[3]);
        setvolume(vals[5]);
        setchange(vals[9]);
      });
  };

  const get_news = () => {
    fetch("https://www.bing.com/news/search?q=" + name)
      .then((res) => res.text())
      .then((body) => {
        const html = Parser.parse(body);
        const arr = html.querySelectorAll(
          ".news-card.newsitem.cardcommon.b_cards2"
        );
        const urls = arr.map((x) => {
          const url = x.rawAttributes.url;
          const imgobj = x.querySelector("img").rawAttributes;
          const thumbnail =
            "https://www.bing.com" +
            ("data-src" in imgobj ? imgobj["data-src"] : imgobj.src);
          const sample = x.querySelector(".snippet").rawAttributes.title;
          return { link: url, img: thumbnail, snippet: sample };
        });
        setlinks(urls);
      });
  };

  useEffect(() => {
    get_intraday(5);
    get_quote();
    get_news();
  }, []);

  return (
    <ScrollView style={{ alignItems: "center" }}>
      <View style={{ marginTop: 50 }}></View>
      <Text>{ticker + " - " + name}</Text>
      <View style={{ alignItems: "center", marginTop: 30 }}>
        <TouchableOpacity onPress={() => get_intraday(1)}>
          <Text>1min</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => get_intraday(5)}>
          <Text>5min</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => get_intraday(15)}>
          <Text>15min</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => get_intraday(30)}>
          <Text>30min</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => get_intraday(60)}>
          <Text>60min</Text>
        </TouchableOpacity>
      </View>

      <Chart slables={slables} prices={prices}></Chart>

      <View style={{ alignItems: "center" }}>
        <Text>{"price - " + price}</Text>
        <Text>{"high - " + high}</Text>
        <Text>{"low - " + low}</Text>
        <Text>{"volume - " + volume}</Text>
        <Text
          style={change.includes("-") ? { color: "red" } : { color: "green" }}
        >
          {change}
        </Text>
      </View>

      <View>
        {links.map((x, i) => {
          return (
            <TouchableOpacity key={i} style={styles.card}>
              <View>
                <Text>{x.snippet}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 4,
    marginLeft: 4,
    marginRight: 4,
    backgroundColor: "blue",
    borderRadius: 30,
  },
});

export default Stock;