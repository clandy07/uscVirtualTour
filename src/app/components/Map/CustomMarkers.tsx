import Image from 'next/image';

import BuildingSvg from '../../../../public/building.svg';
import FoodSvg from '../../../../public/food.svg';
import SportSvg from '../../../../public/sport.svg';
import StudySvg from '../../../../public/study.svg';
import FacilitySvg from '../../../../public/facility.svg';
import TransportSvg from '../../../../public/parking.svg';
import DormSvg from '../../../../public/dorm.svg';
import EventSvg from '../../../../public/event.svg';

const ICON_SIZE = 24; // Inner icon size
const CONTAINER_SIZE = 48; // Outer circle size

interface IconWrapperProps {
  children: React.ReactNode;
  bgColor: string;
  borderColor: string;
}

const IconWrapper = ({ children, bgColor, borderColor }: IconWrapperProps) => (
  <div 
    className="rounded-full flex items-center justify-center border-4 shadow-lg"
    style={{ 
      width: CONTAINER_SIZE, 
      height: CONTAINER_SIZE,
      backgroundColor: bgColor,
      borderColor: borderColor
    }}
  >
    {children}
  </div>
);

export const BuildingIcon = () => (
  <IconWrapper bgColor="#991B1B" borderColor="#FFFFFF">
    <Image 
      src={BuildingSvg}
      alt="Building"
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="brightness-0 invert"
    />
  </IconWrapper>
);

export const FoodIcon = () => (
  <IconWrapper bgColor="#EA580C" borderColor="#FFFFFF">
    <Image 
      src={FoodSvg}
      alt="Food"
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="brightness-0 invert"
    />
  </IconWrapper>
);

export const SportsIcon = () => (
  <IconWrapper bgColor="#16A34A" borderColor="#FFFFFF">
    <Image 
      src={SportSvg}
      alt="Sports"
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="brightness-0 invert"
    />
  </IconWrapper>
);

export const StudyIcon = () => (
  <IconWrapper bgColor="#0891B2" borderColor="#FFFFFF">
    <Image 
      src={StudySvg}
      alt="Study"
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="brightness-0 invert"
    />
  </IconWrapper>
);

export const FacilitiesIcon = () => (
  <IconWrapper bgColor="#7C3AED" borderColor="#FFFFFF">
    <Image 
      src={FacilitySvg}
      alt="Facilities"
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="brightness-0 invert"
    />
  </IconWrapper>
);

export const TransportIcon = () => (
  <IconWrapper bgColor="#6B7280" borderColor="#FFFFFF">
    <Image 
      src={TransportSvg}
      alt="Transport"
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="brightness-0 invert"
    />
  </IconWrapper>
);

export const DormsIcon = () => (
  <IconWrapper bgColor="#DC2626" borderColor="#FFFFFF">
    <Image 
      src={DormSvg}
      alt="Dorms"
      width={ICON_SIZE}
      height={ICON_SIZE}
      className="brightness-0 invert"
    />
  </IconWrapper>
);

interface EventIconProps {
  isOngoing: boolean;
  isUpcoming: boolean;
}

export const EventIcon = ({ isOngoing, isUpcoming }: EventIconProps) => {
  const getBgColor = () => {
    if (isOngoing) return '#10B981'; // Green for ongoing
    if (isUpcoming) return '#3B82F6'; // Blue for upcoming
    return '#9CA3AF'; // Gray for past
  };

  return (
    <IconWrapper bgColor={getBgColor()} borderColor="#FFFFFF">
      <Image 
        src={EventSvg}
        alt="Event"
        width={ICON_SIZE}
        height={ICON_SIZE}
        className="brightness-0 invert"
      />
    </IconWrapper>
  );
};