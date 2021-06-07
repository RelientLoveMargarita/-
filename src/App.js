import * as XLSX from "xlsx";
import { Button, message, Table, Upload } from "antd";
import { useEffect, useState } from "react";
import ExportJsonExcel from 'js-export-excel';

import "./App.css";

const Dragger = Upload.Dragger;

function App() {
  const [tableHeader, setTableHeader] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [data, setData] = useState([]);
  const [allMatch, setAllMatch] = useState(true);

  const validate = () => {
    let res = true;
    for (let item of tableData) {
      if (item["__EMPTY"] != item["__EMPTY_1"]) {
        res = false;
      }
    }
    return res;
  };

  useEffect(() => {
    const isValid = validate();
    console.log(isValid, 'val')
    setAllMatch(isValid);
  }, [tableData]);

  const uploadFilesChange = (file) => {
    // 通过FileReader对象读取文件
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      try {
        const { result } = event.target;
        // 以二进制流方式读取得到整份excel表格对象
        const workbook = XLSX.read(result, { type: "binary" });
        // 存储获取到的数据
        let data = [];
        // 遍历每张工作表进行读取（这里默认只读取第一张表）
        for (const sheet in workbook.Sheets) {
          let tempData = [];
          if (workbook.Sheets.hasOwnProperty(sheet)) {
            // 利用 sheet_to_json 方法将 excel 转成 json 数据
            data = tempData.concat(
              XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
            );
            setData(data);
          }
        }
        //上传成功啦,data为上传后的数据
        // 最终获取到并且格式化后的 json 数据
        message.success("上传成功！");
      } catch (e) {
        // 这里可以抛出文件类型错误不正确的相关提示
        message.error("文件类型不正确！");
      }
      console.log(data);
      let columns = [];
      let dataSource = [];
      // 处理表头
      let keys = data[0] ? Object.keys(data[0]).splice(0, 2) : [];
      columns = keys.map((item, index) => {
        return {
          title: data[0][item],
          dataIndex: item,
          key: item,
        };
      });
      columns.push({
        title: "是否相等",
        key: "equl",
        render: (text, record) => (
          <span>{text["__EMPTY"] == text["__EMPTY_1"] ? "是" : "否"}</span>
        ),
      });
      dataSource = data
        .map((item, index) => {
          return {
            key: index.toString(),
            __EMPTY: item["__EMPTY"],
            __EMPTY_1: item["__EMPTY_1"],
            equl: item["__EMPTY"] == item["__EMPTY_1"]
          };
        })
        .slice(1);

      setTableData(dataSource);
      setTableHeader(columns);
    };
    // 以二进制方式打开文件
    fileReader.readAsBinaryString(file.file);
  };

  const downloadFileToExcel = () => {
    let dataTable = [];  //excel文件中的数据内容
    let option = {};  //option代表的就是excel文件
    dataTable  = tableData;  //从props中获取数据源
    option.fileName = '下载文档';  //excel文件名称
    option.datas = [
        {
            sheetData: dataTable,  //excel文件中的数据源
            sheetName: '1',  //excel文件中sheet页名称
            sheetFilter: ['__EMPTY', '__EMPTY_1', 'equl'],  //excel文件中需显示的列数据
            sheetHeader: ['__EMPTY', '__EMPTY_1', 'equl'], //excel文件中每列的表头名称
        }
    ]
    let toExcel = new ExportJsonExcel(option);  //生成excel文件
    toExcel.saveExcel();  //下载excel文件
}

  return (
    <div className="App">
      是否完全相同？ {allMatch ? "是" : "否"}
      <Dragger
        name="file"
        beforeUpload={function () {
          return false;
        }}
        onChange={uploadFilesChange}
        showUploadList={false}
      >
        <p className="ant-upload-text">
          <span>点击上传文件</span>
          或者拖拽上传
        </p>
      </Dragger>
      <Button
        type="primary"
        onClick={downloadFileToExcel}
        style={{ marginBottom: "15px" }}
      >
        下载
      </Button>
      <Table
        columns={tableHeader}
        dataSource={tableData}
        pagination={{
          pageSize: 5000,
        }}
      />
    </div>
  );
}

export default App;
