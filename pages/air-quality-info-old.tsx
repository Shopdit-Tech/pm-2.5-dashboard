import { Card, Typography, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;

type AQILevel = {
  range: string;
  color: string;
  level: string;
  description: string;
};

type Pollutant = {
  name: string;
  nameEn: string;
  description: string;
};

type Standard = {
  pollutant: string;
  pollutantEn: string;
  standard: string;
  avgTime: string;
};

const AirQualityInfoPage = () => {
  const aqiLevels: AQILevel[] = [
    {
      range: '0 - 25',
      color: '#4299E1',
      level: 'อากาศดีมาก',
      description: 'ประชาชนทุกคนสามารถดำเนินชีวิตได้ตามปกติ',
    },
    {
      range: '26 - 50',
      color: '#48BB78',
      level: 'อากาศดี',
      description: 'ประชาชนทั่วไป: สามารถทำกิจกรรมกลางแจ้งได้ตามปกติ | ประชาชนกลุ่มเสี่ยง: ควรสังเกตอาการผิดปกติ',
    },
    {
      range: '51 - 100',
      color: '#ECC94B',
      level: 'อากาศปานกลาง',
      description: 'ประชาชนทั่วไป: ลดระยะเวลาการทำกิจกรรมกลางแจ้ง | กลุ่มเสี่ยง: หลีกเลี่ยงการออกกำลังกายหนัก',
    },
    {
      range: '101 - 200',
      color: '#ED8936',
      level: 'เริ่มมีผลกระทบต่อสุขภาพ',
      description: 'ประชาชนทั่วไป: หลีกเลี่ยงการทำกิจกรรมกลางแจ้งนาน ๆ | กลุ่มเสี่ยง: หลีกเลี่ยงการออกกำลังกายกลางแจ้ง',
    },
    {
      range: '> 200',
      color: '#F56565',
      level: 'มีผลกระทบต่อสุขภาพ',
      description: 'ประชาชนทั่วไป: หลีกเลี่ยงการออกกลางแจ้ง | กลุ่มเสี่ยง: ควรอยู่ในที่ร่มและหลีกเลี่ยงการออกกำลังกาย',
    },
  ];

  const pollutants: Pollutant[] = [
    {
      name: 'ฝุ่นละอองขนาดไม่เกิน 2.5 ไมครอน (PM2.5)',
      nameEn: 'Particulate Matter ≤ 2.5 micrometers',
      description: 'เป็นฝุ่นที่มีเส้นผ่านศูนย์กลางไม่เกิน 2.5 ไมครอน เกิดจากการเผาไหม้ทั้งจากยานพาหนะ การเผาวัสดุการเกษตร ไฟป่า และกระบวนการอุตสาหกรรม สามารถเข้าไปถึงถุงลมในปอดได้ เป็นผลทำให้เกิดโรคในระบบทางเดินหายใจ',
    },
    {
      name: 'ฝุ่นละอองขนาดไม่เกิน 10 ไมครอน (PM10)',
      nameEn: 'Particulate Matter ≤ 10 micrometers',
      description: 'เป็นฝุ่นที่มีขนาดเส้นผ่านศูนย์กลางไม่เกิน 10 ไมครอน เกิดจากการเผาไหม้เชื้อเพลิง การเผาในที่โล่ง กระบวนการอุตสาหกรรม การบด การโม่ หรือการทำให้เป็นผงจากการก่อสร้าง',
    },
    {
      name: 'ก๊าซโอโซน (O₃)',
      nameEn: 'Ozone',
      description: 'เป็นก๊าซที่ไม่มีสีหรือมีสีฟ้าอ่อน มีกลิ่นฉุน เกิดจากปฏิกิริยาระหว่างก๊าซออกไซด์ของไนโตรเจน และสารประกอบอินทรีย์ระเหยง่าย โดยมีแสงแดดเป็นตัวเร่งปฏิกิริยา มีผลกระทบต่อสุขภาพ โดยก่อให้เกิดการระคายเคืองตา',
    },
    {
      name: 'ก๊าซคาร์บอนมอนอกไซด์ (CO)',
      nameEn: 'Carbon Monoxide',
      description: 'เป็นก๊าซที่ไม่มีสี กลิ่น และรส เกิดจากการเผาไหม้ที่ไม่สมบูรณ์ของเชื้อเพลิงที่มีคาร์บอนเป็นองค์ประกอบ สามารถสะสมอยู่ในร่างกายได้โดยจะไปรวมตัวกับฮีโมโกลบินในเม็ดเลือดแดง',
    },
    {
      name: 'ก๊าซไนโตรเจนไดออกไซด์ (NO₂)',
      nameEn: 'Nitrogen Dioxide',
      description: 'เป็นก๊าซที่ไม่มีสีและกลิ่น ละลายน้ำได้เล็กน้อย เกิดจากการเผาไหม้เชื้อเพลิงต่าง ๆ อุตสาหกรรมบางชนิด มีผลต่อระบบการมองเห็นและผู้ที่มีอาการหอบหืดหรือโรคเกี่ยวกับทางเดินหายใจ',
    },
    {
      name: 'ก๊าซซัลเฟอร์ไดออกไซด์ (SO₂)',
      nameEn: 'Sulfur Dioxide',
      description: 'เป็นก๊าซที่ไม่มีสี หรืออาจมีสีเหลืองอ่อน ๆ มีรสและกลิ่นที่ระดับความเข้มข้นสูง เกิดจากการเผาไหม้เชื้อเพลิงที่มีกำมะถัน สามารถละลายน้ำได้ดี มีผลกระทบต่อสุขภาพ ทำให้เกิดการระคายเคืองต่อเยื่อบุตา ผิวหนัง',
    },
  ];

  const standards: Standard[] = [
    {
      pollutant: 'ก๊าซคาร์บอนมอนอกไซด์',
      pollutantEn: 'Carbon Monoxide (CO)',
      standard: '30 ppm (34.2 mg/m³)\n9 ppm (10.26 mg/m³)',
      avgTime: '1 ชั่วโมง\n8 ชั่วโมง',
    },
    {
      pollutant: 'ก๊าซซัลเฟอร์ไดออกไซด์',
      pollutantEn: 'Sulfur Dioxide (SO₂)',
      standard: '0.30 ppm (780 μg/m³)\n0.12 ppm (0.30 mg/m³)\n0.04 ppm (0.10 mg/m³)',
      avgTime: '1 ชั่วโมง\n24 ชั่วโมง\n1 ปี',
    },
    {
      pollutant: 'ก๊าซไนโตรเจนไดออกไซด์',
      pollutantEn: 'Nitrogen Dioxide (NO₂)',
      standard: '0.17 ppm (0.32 mg/m³)\n0.03 ppm (0.057 mg/m³)',
      avgTime: '1 ชั่วโมง\n1 ปี',
    },
    {
      pollutant: 'ก๊าซโอโซน',
      pollutantEn: 'Ozone (O₃)',
      standard: '0.10 ppm (0.20 mg/m³)\n0.07 ppm (0.14 mg/m³)',
      avgTime: '1 ชั่วโมง\n8 ชั่วโมง',
    },
    {
      pollutant: 'ฝุ่นละอองขนาดไม่เกิน 10 ไมครอน',
      pollutantEn: 'PM₁₀',
      standard: '120 μg/m³\n50 μg/m³',
      avgTime: '24 ชั่วโมง\n1 ปี',
    },
    {
      pollutant: 'ฝุ่นละอองขนาดไม่เกิน 2.5 ไมครอน',
      pollutantEn: 'PM₂.₅',
      standard: '37.5 μg/m³\n15 μg/m³',
      avgTime: '24 ชั่วโมง\n1 ปี',
    },
  ];

  const aqiColumns: ColumnsType<AQILevel> = [
    {
      title: 'AQI',
      dataIndex: 'range',
      key: 'range',
      width: 120,
      align: 'center',
    },
    {
      title: 'สีที่ใช้',
      dataIndex: 'color',
      key: 'color',
      width: 120,
      align: 'center',
      render: (color: string) => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: color,
              border: '2px solid #e5e7eb',
            }}
          />
        </div>
      ),
    },
    {
      title: 'ความหมาย',
      dataIndex: 'level',
      key: 'level',
      width: 200,
      align: 'center',
      render: (text: string, record: AQILevel) => (
        <span
          style={{
            display: 'inline-block',
            padding: '6px 16px',
            borderRadius: '20px',
            backgroundColor: record.color,
            color: 'white',
            fontWeight: 600,
            fontSize: '13px',
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'คำอธิบาย',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => (
        <Text style={{ fontSize: '13px', lineHeight: '1.6' }}>{text}</Text>
      ),
    },
  ];

  const standardColumns: ColumnsType<Standard> = [
    {
      title: 'สารมลพิษในบรรยากาศ',
      dataIndex: 'pollutant',
      key: 'pollutant',
      width: 280,
      render: (text: string, record: Standard) => (
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.pollutantEn}</div>
        </div>
      ),
    },
    {
      title: 'ค่ามาตรฐาน (จะต้องไม่เกิน)',
      dataIndex: 'standard',
      key: 'standard',
      width: 300,
      render: (text: string) => (
        <div style={{ whiteSpace: 'pre-line', fontSize: '13px' }}>{text}</div>
      ),
    },
    {
      title: 'ค่าเฉลี่ยเวลา',
      dataIndex: 'avgTime',
      key: 'avgTime',
      width: 150,
      render: (text: string) => (
        <div style={{ whiteSpace: 'pre-line', fontSize: '13px' }}>{text}</div>
      ),
    },
  ];

  return (
    <div style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8eef3 100%)', minHeight: '100vh', padding: '24px 0' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: '#1a1a1a', fontWeight: 700 }}>
            ข้อมูลความรู้ทางคุณภาพอากาศ
          </Title>
          <Text style={{ fontSize: '14px', color: '#666' }}>
            ข้อมูลดัชนีคุณภาพอากาศ สารมลพิษทางอากาศ และมาตรฐานคุณภาพอากาศ
          </Text>
        </div>

        {/* AQI Overview */}
        <Card
          style={{
            borderRadius: 16,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Title level={4} style={{ marginTop: 0 }}>
            ดัชนีคุณภาพอากาศ (Air Quality Index : AQI)
          </Title>
          <Paragraph style={{ fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
            เป็นการรายงานข้อมูลคุณภาพอากาศในรูปแบบที่ง่ายต่อความเข้าใจของประชาชนทั่วไป
            เพื่อเผยแพร่ประชาสัมพันธ์ให้สาธารณชนได้รับทราบถึงสถานการณ์มลพิษทางอากาศในแต่ละพื้นที่ว่าอยู่ในระดับใด
            มีผลกระทบต่อสุขภาพอนามัยหรือไม่ ดัชนีคุณภาพอากาศ 1 ค่า
            ใช้เป็นตัวแทนค่าความเข้มข้นของสารมลพิษทางอากาศ 6 ชนิด
          </Paragraph>

          <div style={{ marginTop: 24 }}>
            <Table
              columns={aqiColumns}
              dataSource={aqiLevels}
              pagination={false}
              rowKey="range"
              bordered
            />
          </div>

          <div style={{ marginTop: 24, padding: '16px', background: '#f0f9ff', borderRadius: 8, border: '1px solid #bfdbfe' }}>
            <Text style={{ fontSize: '13px', color: '#1e40af' }}>
              <strong>หมายเหตุ:</strong> ดัชนีคุณภาพอากาศ 100 จะมีค่าเทียบเท่ามาตรฐานคุณภาพอากาศในบรรยากาศโดยทั่วไป
              หากดัชนีคุณภาพอากาศมีค่าสูงเกินกว่า 100 แสดงว่าค่าความเข้มข้นของมลพิษทางอากาศมีค่าเกินมาตรฐาน
              และคุณภาพอากาศในวันนั้นจะเริ่มมีผลกระทบต่อสุขภาพอนามัยของประชาชน
            </Text>
          </div>
        </Card>

        {/* Pollutants Information */}
        <Card
          style={{
            borderRadius: 16,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Title level={4} style={{ marginTop: 0 }}>
            สารมลพิษทางอากาศ
          </Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pollutants.map((pollutant, index) => (
              <div
                key={index}
                style={{
                  padding: '20px',
                  background: index % 2 === 0 ? '#f9fafb' : 'white',
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <Text strong style={{ fontSize: '15px', color: '#1a1a1a' }}>
                    {pollutant.name}
                  </Text>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: '13px', color: '#666', fontStyle: 'italic' }}>
                    {pollutant.nameEn}
                  </Text>
                </div>
                <Paragraph style={{ margin: 0, fontSize: '14px', lineHeight: '1.8', color: '#333' }}>
                  {pollutant.description}
                </Paragraph>
              </div>
            ))}
          </div>
        </Card>

        {/* Standards Table */}
        <Card
          style={{
            borderRadius: 16,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Title level={4} style={{ marginTop: 0 }}>
            มาตรฐานคุณภาพอากาศในบรรยากาศโดยทั่วไป
          </Title>
          <Paragraph style={{ fontSize: '14px', color: '#666', marginBottom: 24 }}>
            ตามประกาศคณะกรรมการสิ่งแวดล้อมแห่งชาติ
          </Paragraph>
          <Table
            columns={standardColumns}
            dataSource={standards}
            pagination={false}
            rowKey="pollutantEn"
            bordered
            scroll={{ x: 800 }}
          />

          <div style={{ marginTop: 24, padding: '16px', background: '#fef3c7', borderRadius: 8, border: '1px solid #fbbf24' }}>
            <Text style={{ fontSize: '13px', color: '#92400e' }}>
              <strong>หมายเหตุ:</strong><br />
              • ppm คือ ส่วนในล้านส่วน<br />
              • mg/m³ คือ มิลลิกรัมต่อลูกบาศก์เมตร<br />
              • μg/m³ คือ ไมโครกรัมต่อลูกบาศก์เมตร
            </Text>
          </div>
        </Card>

        {/* Reference */}
        <Card
          style={{
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            background: '#f0fdf4',
            border: '1px solid #86efac',
          }}
        >
          <Title level={5} style={{ marginTop: 0, color: '#166534' }}>
            แหล่งอ้างอิง
          </Title>
          <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.8' }}>
            <div>• กรมควบคุมมลพิษ กระทรวงทรัพยากรธรรมชาติและสิ่งแวดล้อม</div>
            <div>• ประกาศคณะกรรมการสิ่งแวดล้อมแห่งชาติ ฉบับต่าง ๆ</div>
            <div>• มาตรฐานคุณภาพอากาศในบรรยากาศโดยทั่วไป พ.ศ. 2538 - 2565</div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AirQualityInfoPage;
