import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Table } from "antd";
import LineGraph from "./LineGraph";

interface JobData {
  work_year: number;
  totalJobs: number;
  avgSalary: number;
}

interface JobTitleData {
  job_title: string;
  jobCount: number;
}

interface PapaParseResult {
  data: any[];
}

const MainTable: React.FC = () => {
  const [data, setData] = useState<JobData[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [jobTitleData, setJobTitleData] = useState<JobTitleData[]>([]);

  const fetchCSVData = async () => {
    try {
      const response = await fetch("/salaries.csv");
      const csvData = await response.text();

      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (result: PapaParseResult) => {
          const yearMap: {
            [key: number]: { totalJobs: number; totalSalary: number };
          } = {};
          const jobTitleMap: { [key: number]: { [title: string]: number } } =
            {};

          result.data.forEach((row: any) => {
            const year = parseInt(row.work_year);
            const salary = parseFloat(row.salary_in_usd);
            const jobTitle = row.job_title;

            if (!isNaN(year) && !isNaN(salary)) {
              if (!yearMap[year]) {
                yearMap[year] = { totalJobs: 0, totalSalary: 0 };
                jobTitleMap[year] = {};
              }

              yearMap[year].totalJobs += 1;
              yearMap[year].totalSalary += salary;

              if (jobTitle) {
                if (!jobTitleMap[year][jobTitle]) {
                  jobTitleMap[year][jobTitle] = 0;
                }
                jobTitleMap[year][jobTitle] += 1;
              }
            }
          });

          const parsedData: JobData[] = Object.keys(yearMap).map((year) => {
            const totalJobs = yearMap[parseInt(year)].totalJobs;
            const avgSalary = yearMap[parseInt(year)].totalSalary / totalJobs;

            return {
              work_year: parseInt(year),
              totalJobs: totalJobs,
              avgSalary: avgSalary,
            };
          });

          setData(parsedData);
          setJobTitleData([]);
        },
      });
    } catch (error) {
      console.error("Error fetching or parsing CSV data:", error);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  const handleRowClick = (record: JobData) => {
    setSelectedYear(record.work_year);

    fetch(`/salaries.csv`)
      .then((response) => response.text())
      .then((csvData) => {
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (result: PapaParseResult) => {
            const jobTitleMap: { [title: string]: number } = {};

            result.data.forEach((row: any) => {
              const year = parseInt(row.work_year);
              const jobTitle = row.job_title;

              if (year === record.work_year && jobTitle) {
                if (!jobTitleMap[jobTitle]) {
                  jobTitleMap[jobTitle] = 0;
                }
                jobTitleMap[jobTitle] += 1;
              }
            });

            const jobTitleData: JobTitleData[] = Object.keys(jobTitleMap).map(
              (title) => ({
                job_title: title,
                jobCount: jobTitleMap[title],
              })
            );

            setJobTitleData(jobTitleData);
          },
        });
      })
      .catch((error) =>
        console.error("Error fetching job titles data:", error)
      );
  };

  const columns = [
    {
      title: "Year",
      dataIndex: "work_year",
      key: "year",
      sorter: (a: JobData, b: JobData) => a.work_year - b.work_year,
      className: "text-gray-900 font-semibold",
    },
    {
      title: "Total Jobs",
      dataIndex: "totalJobs",
      key: "totalJobs",
      sorter: (a: JobData, b: JobData) => a.totalJobs - b.totalJobs,
      className: "text-gray-900 font-semibold",
    },
    {
      title: "Average Salary (USD)",
      dataIndex: "avgSalary",
      key: "avgSalary",
      sorter: (a: JobData, b: JobData) => a.avgSalary - b.avgSalary,
      className: "text-gray-900 font-semibold",
    },
  ];

  const jobTitleColumns = [
    {
      title: "Job Title",
      dataIndex: "job_title",
      key: "job_title",
      className: "text-gray-800 font-medium",
    },
    {
      title: "Number of Jobs",
      dataIndex: "jobCount",
      key: "jobCount",
      className: "text-gray-800 font-medium",
    },
  ];

  return (
    <>
      <h1 className="text-4xl font-bold text-center text-gray-800 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 bg-clip-text text-transparent py-4 mb-8">
        ML Engineers Salary Analyzer
      </h1>
      <div className="container mx-auto p-4 md:p-8">
        {/* Main Table */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
          <h1 className="text-2xl font-bold text-[#ffb703] mb-4">
            Job Data Overview
          </h1>
          <Table
            columns={columns}
            dataSource={data}
            rowKey="work_year"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
            className="border rounded-lg"
            pagination={{ pageSize: 5 }} // Limit rows per page for better display on small screens
          />
        </div>

        {/* Job Title Table */}
        {selectedYear && jobTitleData.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 mb-8">
            <h2 className="text-xl font-bold text-[#ffb703] mb-4">
              Job Titles in {selectedYear}
            </h2>
            <Table
              columns={jobTitleColumns}
              dataSource={jobTitleData}
              rowKey="job_title"
              className="border rounded-lg"
              pagination={{ pageSize: 5 }} // Limit rows per page for better display on small screens
            />
          </div>
        )}

        {/* Line Graph */}
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
          <LineGraph data={data} />
        </div>
      </div>
      <footer className="bg-gray-900 text-white text-center py-4 mt-8">
        <p className="text-sm">
          &copy; 2024 Ashok Vaishnav. All Rights Reserved.
        </p>
      </footer>
    </>
  );
};

export default MainTable;
