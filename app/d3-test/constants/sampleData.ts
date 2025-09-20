export const sampleProcessData = {
  width: "100%",
  height: "400px",
  unit: "개수",
  data: [
    {
      label: "Dataset 1",
      items: [
        {
          tooltipTitle: "Dataset 1 - 1월",
          x: "2024-01-01 00:00:00",
          y: 30,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 1 - 2월",
          x: "2024-02-01 00:00:00",
          y: 45,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 1 - 3월",
          x: "2024-03-01 00:00:00",
          y: 25,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 1 - 4월",
          x: "2024-04-01 00:00:00",
          y: 60,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 1 - 5월",
          x: "2024-05-01 00:00:00",
          y: 55,
          unit: 1
        }
      ]
    },
    {
      label: "Dataset 2",
      items: [
        {
          tooltipTitle: "Dataset 2 - 1월",
          x: "2024-01-01 00:00:00",
          y: 20,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 2 - 2월",
          x: "2024-02-01 00:00:00",
          y: 35,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 2 - 3월",
          x: "2024-03-01 00:00:00",
          y: 40,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 2 - 4월",
          x: "2024-04-01 00:00:00",
          y: 30,
          unit: 1
        },
        {
          tooltipTitle: "Dataset 2 - 5월",
          x: "2024-05-01 00:00:00",
          y: 65,
          unit: 1
        }
      ]
    },
    {
      label: "Total",
      items: [
        {
          tooltipTitle: "Total - 1월",
          x: "2024-01-01 00:00:00",
          y: 50,
          unit: 1
        },
        {
          tooltipTitle: "Total - 2월",
          x: "2024-02-01 00:00:00",
          y: 80,
          unit: 1
        },
        {
          tooltipTitle: "Total - 3월",
          x: "2024-03-01 00:00:00",
          y: 65,
          unit: 1
        },
        {
          tooltipTitle: "Total - 4월",
          x: "2024-04-01 00:00:00",
          y: 90,
          unit: 1
        },
        {
          tooltipTitle: "Total - 5월",
          x: "2024-05-01 00:00:00",
          y: 120,
          unit: 1
        }
      ]
    }
  ],
  colorData: ["#A0DDFF", "#758ECD", "#C1CEFE", "#7189FF", "#624CAB"],
  xScaleList: ["2024-01-01 00:00:00", "2024-05-31 23:59:59"] as [string, string],
  interval: "1MO" as const
}