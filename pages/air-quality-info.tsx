import { Card, Typography, Table, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const { Title, Text, Paragraph } = Typography;

type PM25Level = {
  range: string;
  color: string;
  level: string;
  publicGuidance: string;
  riskGroupGuidance: string;
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
  const pollutants: Pollutant[] = [
    {
      name: 'อุณหภูมิ (Temperature)',
      nameEn: 'Temperature',
      description: 'เป็นการวัดระดับความร้อนหรือความเย็นของสภาพแวดล้อม แม้จะเป็นปัจจัยทางกายภาพ แต่ก็ส่งผลกระทบโดยตรงต่อสุขภาพและความเป็นอยู่ อุณหภูมิที่สูงเกินไป (สภาวะร้อน) จะทำให้ร่างกายเกิดความเครียดจากความร้อน, เสียเหงื่อมากจนขาดน้ำ, อ่อนเพลีย และหากรุนแรงอาจนำไปสู่โรคลมแดด (Heatstroke) ในขณะที่อุณหภูมิที่ต่ำเกินไป (สภาวะเย็น) จะเพิ่มความเสี่ยงต่อภาวะตัวเย็นเกิน (Hypothermia), ทำให้การไหลเวียนโลหิตลดลง และเพิ่มภาระการทำงานของหัวใจ',
    },
    {
      name: 'ความชื้น (Humidity)',
      nameEn: 'Humidity',
      description: 'คือปริมาณไอน้ำที่มีอยู่ในอากาศ และเป็นปัจจัยสำคัญต่อคุณภาพอากาศภายในอาคาร หากมีความชื้นสูงเกินไป (อากาศชื้น) จะสร้างสภาวะที่เอื้อต่อการเจริญเติบโตของเชื้อรา, แบคทีเรีย, และไรฝุ่น ซึ่งเป็นสาเหตุหลักของโรคภูมิแพ้และปัญหาในระบบทางเดินหายใจ ทำให้เกิดกลิ่นอับ ในทางกลับกัน หากความชื้นต่ำเกินไป (อากาศแห้ง) จะทำให้ผิวแห้ง, เยื่อบุจมูกและลำคอระคายเคือง, เกิดไฟฟ้าสถิต และอาจเพิ่มโอกาสในการแพร่กระจายของไวรัสในอากาศได้ง่ายขึ้น',
    },
    {
      name: 'คาร์บอนไดออกไซด์ (CO₂)',
      nameEn: 'Carbon Dioxide',
      description: 'เป็นก๊าซที่ไม่มีสี ไม่มีกลิ่น ซึ่งเกิดขึ้นตามธรรมชาติจากกระบวนการหายใจของสิ่งมีชีวิต และเกิดจากการเผาไหม้เชื้อเพลิงฟอสซิล แม้ว่า CO₂ จะไม่เป็นพิษร้ายแรงในระดับต่ำ แต่ในสภาพแวดล้อมภายในอาคารที่มีการระบายอากาศไม่ดี CO₂ สามารถสะสมในปริมาณสูงได้ (จากการหายใจออกของคน) ส่งผลกระทบโดยตรงต่อการทำงานของสมอง ทำให้เกิดอาการง่วงซึม, ปวดศีรษะ, เวียนศีรษะ, ขาดสมาธิ, อ่อนเพลีย และลดประสิทธิภาพในการตัดสินใจ',
    },
    {
      name: 'ฝุ่นละอองขนาดไม่เกิน 1 ไมครอน (PM1)',
      nameEn: 'Particulate Matter ≤ 1 micrometer',
      description: 'เป็นฝุ่นที่มีเส้นผ่านศูนย์กลางเล็กกว่า 1 ไมครอน (เล็กกว่า PM2.5) จัดเป็นอนุภาคที่ละเอียดที่สุด (Ultrafine Particles) ส่วนใหญ่เกิดจากการเผาไหม้ที่ไม่สมบูรณ์ เช่น ควันไอเสียจากยานพาหนะ, กระบวนการอุตสาหกรรม, และปฏิกิริยาเคมีในบรรยากาศ ด้วยขนาดที่เล็กมาก PM1 จึงสามารถทะลุผ่านถุงลมปอดเข้าสู่กระแสเลือดได้โดยตรง และกระจายไปยังอวัยวะต่างๆ ทั่วร่างกาย ส่งผลกระทบอย่างรุนแรงต่อระบบหัวใจและหลอดเลือด และสามารถนำพาสารพิษหรือโลหะหนักเข้าสู่สมองได้',
    },
    {
      name: 'ฝุ่นละอองขนาดไม่เกิน 2.5 ไมครอน (PM2.5)',
      nameEn: 'Particulate Matter ≤ 2.5 micrometers',
      description: 'เป็นฝุ่นที่มีเส้นผ่านศูนย์กลางไม่เกิน 2.5 ไมครอน เกิดจากการเผาไหม้ทั้งจากยานพาหนะ การเผาวัสดุการเกษตร ไฟป่า และกระบวนการอุตสาหกรรม สามารถเข้าไปถึงถุงลมในปอดได้ เป็นผลทําให้เกิดโรคในระบบทางเดินหายใจ และโรคปอดต่างๆ หากได้รับในปริมาณมากหรือเป็นเวลานานจะสะสมในเนื้อเยื่อปอด ทําให้การทํางานของปอดเสื่อมประสิทธิภาพลง ทําให้หลอดลมอักเสบ มีอาการหอบหืด',
    },
    {
      name: 'ฝุ่นละอองขนาดไม่เกิน 10 ไมครอน (PM10)',
      nameEn: 'Particulate Matter ≤ 10 micrometers',
      description: 'เป็นฝุ่นหยาบที่มีเส้นผ่านศูนย์กลางไม่เกิน 10 ไมครอน มักเกิดจากแหล่งกำเนิดตามธรรมชาติ เช่น ละอองเกสร, เชื้อรา, ฝุ่นดิน หรือเกิดจากกิจกรรมของมนุษย์ เช่น การก่อสร้าง, การบดหิน, ฝุ่นจากการจราจรบนถนน หรือการเผาในที่โล่ง ฝุ่น PM10 มักจะถูกดักจับได้ที่ทางเดินหายใจส่วนบน (จมูกและลำคอ) ทำให้เกิดการระคายเคือง, ไอ, จาม หรือกระตุ้นอาการของผู้ที่เป็นโรคภูมิแพ้และโรคหอบหืด',
    },
    {
      name: 'สารอินทรีย์ระเหยง่ายทั้งหมด (TVOCs)',
      nameEn: 'Total Volatile Organic Compounds',
      description: 'เป็นกลุ่มของสารเคมีหลากหลายชนิดที่ระเหยเป็นก๊าซได้ง่ายที่อุณหภูมิห้อง แหล่งกำเนิดหลักมักมาจากผลิตภัณฑ์ภายในอาคาร เช่น สี, ทินเนอร์, น้ำยาทำความสะอาด, กาว, เฟอร์นิเจอร์ใหม่ (การปล่อยก๊าซจากวัสดุ), สเปรย์ปรับอากาศ และเครื่องใช้สำนักงาน การสูดดม TVOCs ในปริมาณมากหรือเป็นเวลานาน สามารถทำให้เกิดการระคายเคืองตา จมูก และลำคออย่างเฉียบพลัน, ปวดศีรษะ, คลื่นไส้, เวียนศีรษะ และหากสัมผัสต่อเนื่องในระยะยาวอาจทำลายตับ ไต และระบบประสาทส่วนกลาง',
    },
  ];

  const pm25Levels: PM25Level[] = [
    {
      range: '0 - 15.0',
      color: '#4299E1',
      level: 'คุณภาพอากาศดีมาก',
      publicGuidance: 'ทำกิจกรรมได้ตามปกติ',
      riskGroupGuidance: 'ทำกิจกรรมได้ตามปกติ',
    },
    {
      range: '15.1 - 25.0',
      color: '#48BB78',
      level: 'คุณภาพอากาศดี',
      publicGuidance: 'ทำกิจกรรมได้ตามปกติ',
      riskGroupGuidance: 'หลีกเลี่ยงการกิจกรรมนอกอาคารและควรเฝ้าระวังตนเอง',
    },
    {
      range: '25.1 - 37.5',
      color: '#ECC94B',
      level: 'คุณภาพอากาศปานกลาง',
      publicGuidance: 'หลีกเลี่ยงการออกกำลังกายกลางแจ้ง / การทำงานที่ใช้แรงมาก สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง หากมีอาการผิดปกติ ให้รีบพบแพทย์',
      riskGroupGuidance: 'ลดระยะเวลาการออกกำลังกายกลางแจ้ง / การทำงานที่ใช้แรงมาก สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง หากมีอาการผิดปกติ ให้รีบพบแพทย์',
    },
    {
      range: '37.6 - 75.0',
      color: '#ED8936',
      level: 'เริ่มมีผลกระทบต่อสุขภาพ',
      publicGuidance: 'ลดระยะเวลาออกกำลังกายกลางแจ้ง / การทำงานที่ใช้แรงมาก สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง หากมีอาการผิดปกติ ให้รีบพบแพทย์',
      riskGroupGuidance: 'จำกัดระยะเวลาการออกกำลังกายกลางแจ้ง / การทำงานที่ใช้แรงมาก สวมหน้ากากป้องกันฝุ่นละอองทุกครั้งเมื่ออยู่กลางแจ้ง / ควรอยู่ในห้องปลอดฝุ่น ลดกิจกรรมที่ก่อให้เกิดฝุ่นละออง ภายในบ้าน หากมีอาการผิดปกติ ให้รีบพบแพทย์',
    },
    {
      range: '75.1 ขึ้นไป',
      color: '#F56565',
      level: 'มีผลกระทบต่อสุขภาพ',
      publicGuidance: 'งดทำกิจกรรมนอกอาคาร และการออกกำลังกายกลางแจ้ง อยู่ในห้องปลอดฝุ่น สวมหน้ากากกันฝุ่นทุกครั้ง และหากมีอาการผิดปกติ ให้รีบพบแพทย์',
      riskGroupGuidance: 'งดทำกิจกรรมนอกอาคาร และการออกกำลังกายกลางแจ้ง อยู่ในห้องปลอดฝุ่น สวมหน้ากากกันฝุ่นทุกครั้ง และหากมีอาการผิดปกติ ให้รีบพบแพทย์ ผู้ที่มีโรคประจำตัวเตรียมยาและอุปกรณ์ที่จำเป็นให้พร้อม รวมถึงปฏิบัติตามคำแนะนำทางการแพทย์',
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

  const pm25Columns: ColumnsType<PM25Level> = [
    {
      title: 'ระดับ PM2.5 (μg/m³)',
      dataIndex: 'range',
      key: 'range',
      width: 150,
      align: 'center',
      render: (text: string) => (
        <Text strong style={{ fontSize: '13px' }}>{text}</Text>
      ),
    },
    {
      title: 'สีและความหมาย',
      dataIndex: 'level',
      key: 'level',
      width: 200,
      align: 'center',
      render: (text: string, record: PM25Level) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: record.color,
              border: '2px solid #e5e7eb',
            }}
          />
          <Text strong style={{ fontSize: '13px', textAlign: 'center' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'ข้อควรปฏิบัติ - ประชาชนทุกคน',
      dataIndex: 'publicGuidance',
      key: 'publicGuidance',
      render: (text: string) => (
        <Text style={{ fontSize: '13px', lineHeight: '1.6' }}>{text}</Text>
      ),
    },
    {
      title: 'ข้อควรปฏิบัติ - กลุ่มเสี่ยง',
      dataIndex: 'riskGroupGuidance',
      key: 'riskGroupGuidance',
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
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 50px' }}>
        {/* Page Header */}
        <div style={{ marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: '#1a1a1a', fontWeight: 700 }}>
            ข้อมูลความรู้ทางคุณภาพอากาศ
          </Title>
          <Text style={{ fontSize: '14px', color: '#666' }}>
            ข้อมูลพารามิเตอร์คุณภาพอากาศ สารมลพิษทางอากาศ และมาตรฐานคุณภาพอากาศ
          </Text>
        </div>

        {/* Parameters Information */}
        <Card
          style={{
            borderRadius: 16,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Title level={4} style={{ marginTop: 0 }}>
            พารามิเตอร์คุณภาพอากาศ
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

        <Divider />

        {/* PM2.5 Specific Guidelines */}
        <Card
          style={{
            borderRadius: 16,
            marginBottom: 24,
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          }}
        >
          <Title level={4} style={{ marginTop: 0 }}>
            ระดับสีและเกณฑ์ของฝุ่น PM2.5
          </Title>
          <Paragraph style={{ fontSize: '14px', color: '#666', marginBottom: 24 }}>
            แนวทางปฏิบัติสำหรับประชาชนทั่วไปและกลุ่มเสี่ยง
          </Paragraph>
          <Table
            columns={pm25Columns}
            dataSource={pm25Levels}
            pagination={false}
            rowKey="range"
            bordered
            scroll={{ x: 1000 }}
          />

          <div style={{ marginTop: 24, padding: '16px', background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd666' }}>
            <Text style={{ fontSize: '13px', color: '#ad6800' }}>
              <strong>กลุ่มเสี่ยง ได้แก่:</strong> เด็ก, ผู้สูงอายุ, หญิงตั้งครรภ์, ผู้ป่วยโรคหัวใจ, ผู้ป่วยโรคปอด, 
              ผู้ป่วยโรคหอบหืด, ผู้ที่มีภูมิคุ้มกันต่ำ และผู้ที่ทำงานกลางแจ้ง
            </Text>
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
