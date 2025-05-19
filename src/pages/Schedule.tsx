import { useState } from "react";
import SidebarNav from "@/components/schedule/SidebarNav";
import { DoctorsFilter } from "@/components/schedule/DoctorsFilter";
import ConsultationTypeFilter from "@/components/schedule/ConsultationTypeFilter";
import ScheduleHeader from "@/components/schedule/ScheduleHeader";
import AppointmentCalendar from "@/components/schedule/AppointmentCalendar";
import AppPageLayout from "@/components/ui/AppPageLayout";

const doctorsList = [
  {
    id: 1,
    name: "Darlene Robertson",
    avatar: "https://randomuser.me/api/portraits/women/40.jpg",
    specialty: "Family therapist",
    isCurrent: true,
  },
  {
    id: 2,
    name: "Emily Carter",
    avatar: "https://randomuser.me/api/portraits/women/69.jpg",
    specialty: "Psychotherapist",
    isCurrent: false,
  },
  {
    id: 3,
    name: "Dr. McCoy",
    avatar: "https://randomuser.me/api/portraits/men/10.jpg",
    specialty: "Psychotherapist",
    isCurrent: false,
  },
  {
    id: 4,
    name: "Max Worthington",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    specialty: "Child psychologist",
    isCurrent: false,
  },
  {
    id: 5,
    name: "Michael Thompson",
    avatar: "https://randomuser.me/api/portraits/men/41.jpg",
    specialty: "Psychiatrist",
    isCurrent: false,
  },
];

const initialCheckedDoctors = doctorsList.map((d) => true);

const appointmentData = [
  {
    id: 1,
    doctorId: 1,
    patient: "Nichols Family",
    type: "Family Consultation",
    timeRange: "10:00 am - 11:30 am",
    from: "10:00",
    to: "11:30",
    color: "linear-gradient(90deg,#f4f6fd 60%, #d0e7ff 100%)",
  },
  {
    id: 2,
    doctorId: 2,
    patient: "Ruby Jackson",
    type: "Private Consultation",
    timeRange: "09:00 am - 10:00 am",
    from: "09:00",
    to: "10:00",
    color: "linear-gradient(90deg,#ffeefc 60%, #f5f5ff 100%)",
  },
  {
    id: 3,
    doctorId: 1,
    patient: "Darlene Robertson",
    type: "Group Consultation",
    timeRange: "09:00 am - 10:00 am",
    from: "09:00",
    to: "10:00",
    color: "linear-gradient(90deg,#d8f3ee 60%, #dadeff 100%)",
  },
  {
    id: 4,
    doctorId: 5,
    patient: "Max Worthington",
    type: "Group Consultation",
    timeRange: "12:00 am - 1:30 pm",
    from: "12:00",
    to: "13:30",
    color: "linear-gradient(90deg,#eef0fe 60%, #ddeeee 100%)",
  },
];

const allConsultations = [
  "Psychotherapy",
  "Psychiatric consultation",
  "Child psychology",
  "Family therapy",
  "Gestalt therapy",
  "Art therapy",
  "Sleep therapy",
];

export default function Schedule() {
  const [checkedDoctors, setCheckedDoctors] = useState(initialCheckedDoctors);
  const [consultationTypes, setConsultationTypes] = useState([...allConsultations]);
  const [day, setDay] = useState(new Date());

  // Map selected doctors
  const filteredDoctors = doctorsList
    .map((doc, i) => ({
      ...doc,
      checked: checkedDoctors[i],
      onChange: (checked: boolean) => {
        const arr = [...checkedDoctors];
        arr[i] = checked;
        setCheckedDoctors(arr);
      },
    }))
    .filter((doc) => doc.checked);

  // Filter appointmentData by selected doctors and consultations
  const appointments = appointmentData.filter(
    (a) =>
      filteredDoctors.some((doc) => doc.id === a.doctorId) &&
      consultationTypes.some((type) => a.type === type)
  );

  return (
    <AppPageLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#f4f7ff] via-[#e3eafe] to-[#ffffff] flex flex-col">
        <div className="flex flex-1 w-full overflow-hidden">
          {/* Sidebar */}
          <SidebarNav />
          {/* Main content */}
          <div className="flex-1 py-3 px-1 md:px-8 flex flex-col gap-0">
            <ScheduleHeader userAvatar={"https://randomuser.me/api/portraits/women/40.jpg"} />
            <div className="flex flex-col md:flex-row gap-6 mt-2">
              <div className="min-w-[290px] max-w-[320px] w-full flex-shrink-0 flex flex-col gap-5">
                <DoctorsFilter
                  doctors={doctorsList.map((doc, i) => ({
                    ...doc,
                    checked: checkedDoctors[i],
                    onChange: (checked: boolean) => {
                      const arr = [...checkedDoctors];
                      arr[i] = checked;
                      setCheckedDoctors(arr);
                    },
                  }))}
                  onClear={() => setCheckedDoctors(doctorsList.map(_ => false))}
                />
                <ConsultationTypeFilter
                  checked={consultationTypes}
                  onChange={setConsultationTypes}
                />
              </div>
              {/* Appointment Calendar */}
              <div className="flex-1 min-w-0">
                <AppointmentCalendar
                  doctors={filteredDoctors}
                  appointments={appointments}
                  day={day}
                  onPrevDay={() => setDay(prev => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() - 1);
                    return d;
                  })}
                  onNextDay={() => setDay(prev => {
                    const d = new Date(prev);
                    d.setDate(d.getDate() + 1);
                    return d;
                  })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppPageLayout>
  );
}
