'use client';

import { useRouter, useSearchParams } from "next/navigation";
import useSearchModal from "../hooks/useSearchModal";
import Modal from "./Modal";
import { useCallback, useMemo, useState } from "react";
import { Range } from "react-date-range";
import dynamic from "next/dynamic";
import CountrySelect, { CountrySelectValue } from "../inputs/CountrySelect";
import qs from  'query-string'
import { formatISO, set } from "date-fns";
import Heading from "../Heading";
import { Country } from "world-countries";
import Calendar from "../inputs/Calendar";
import Counter from "../inputs/Counter";

enum STEPS {
      LOCATION = 0,
      DATE = 1,
      INFO = 2
}

const SearchModal = () => {
      const searchModal = useSearchModal();
      const router = useRouter();
      const params = useSearchParams();

      const [location, setLocation] = useState<CountrySelectValue>();
      const [stop, setStop] = useState(); 
      const [step, setStep] = useState(STEPS.LOCATION);
      const [guestCount, setGuestCount] = useState(1);
      const [roomCount, setRoomCount] = useState(1);
      const [bathroomCount, setBathroomCount] = useState(1);
      const [dateRange, setDateRange] = useState<Range>({
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
      })

      const Map = useMemo(() => dynamic(() => import('../Map'), { 
            ssr: false 
      }), [location])
  
      const onBack = useCallback(() => {
            setStep(step - 1);
      }, [step])

      const onNext = useCallback(() => {
            setStep(step + 1);
      }, [step])

      const onSubmit = useCallback(async () => {
            if(step !== STEPS.INFO) {
                  return onNext();
            } 

            let currentQuery: any = {};

            if(params) {
                  currentQuery = qs.parse(params.toString());
            }

            const updatedQuery: any = {
                  ...currentQuery,
                  location: location?.value,
                  guestCount,
                  roomCount,
                  bathroomCount,
                  dateRange
            }

            if(dateRange.startDate){
                  updatedQuery.startDate = formatISO(dateRange.startDate);
            }

            if(dateRange.endDate){
                  updatedQuery.endDate = formatISO(dateRange.endDate);
            }
            

            const url = qs.stringifyUrl({
                  url: '/',
                  query: updatedQuery
            },{skipNull: true});
             
            setStep(STEPS.LOCATION);
            searchModal.onClose();
            router.push(url);
      },[
            step,
            location, 
            guestCount, 
            roomCount, 
            bathroomCount,
            dateRange,
            params,
            onNext,
            searchModal,
            router]);

            const actionLabel = useMemo(() => {
                  if(step === STEPS.INFO) {
                        return 'Search';
                  }

                  return 'Next';
            }, [step]);

            const secondaryActionLabel = useMemo(() => {
                  if(step === STEPS.LOCATION) {
                        return undefined;
                  }
                  return 'Back';
            }, [step]);
            
            let bodyContent = (
                  <div className="flex flex-col gap-8">
                        <Heading 
                              title="Where do you wanna go?"
                              subtitle="Find the perfect place for your next trip" 
                        />
                        <CountrySelect
                              value={location}
                              onChange={(value) => setLocation(value as CountrySelectValue)}
                        />
                        <hr/>
                        <Map center={location?.latlng} />
                  </div>
            )

            if(step === STEPS.DATE) {
                  bodyContent = (
                        <div className="flex flex-col gap-8">
                              <Heading 
                                    title="When do you plan to go?"
                                    subtitle="Make sure everyone is free"
                              />
                              <Calendar
                                    value={dateRange}
                                    onChange={(value) => setDateRange(value.selection)}
                              />
                        </div>
                  )
            }

            if(step === STEPS.INFO) {
                  bodyContent = (
                        <div className="flex flex-col gap-8">
                              <Heading 
                                    title="More information"
                                    subtitle="Find the perfect place for your next trip"
                              />      
                              <Counter 
                                    title="Guests"
                                    subtitle="How many guest's are coming?"
                                    value={guestCount}
                                    onChange={setGuestCount}
                              />
                              <Counter 
                                    title="Rooms"
                                    subtitle="How many rooms do you need?"
                                    value={roomCount}
                                    onChange={setRoomCount}
                              />
                              <Counter 
                                    title="Bathroom"
                                    subtitle="How many bathrooms do you need?"
                                    value={bathroomCount}
                                    onChange={setBathroomCount}
                              />
                        </div>
                  )
            }

      return (
      <Modal 
            isOpen={searchModal.isOpen}
            onClose={searchModal.onClose}
            onSubmit={onSubmit}
            title="Filters"
            actionLabel={actionLabel}
            secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
            secondaryActionLabel={secondaryActionLabel}
            body={bodyContent}
      />
  );
}

export default SearchModal