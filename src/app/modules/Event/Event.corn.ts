import cron from 'node-cron';
import { Event } from './Event.model';

const combineDateTime = (dateStr: string, timeStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);
    return new Date(year, month - 1, day, hour, minute);
};

export const startEventStatusCron = () => {
    // Every 4 hours
    cron.schedule('* */4 * * *', async () => {
        try {
            const now = new Date();

            const events = await Event.find({ isDeleted: false, eventStatus: 'APPROVED', eventPosition: { $ne: 'COMPLETED' } });

            let completedCount = 0;
            let ongoingCount = 0;

            for (const event of events) {
                const startDateTime = combineDateTime(event.eventDate, event.eventStartTime);
                const endDateTime = combineDateTime(event.eventEndDate, event.eventEndTime);

                if (now > endDateTime && event.eventPosition !== 'COMPLETED') {
                    await Event.updateOne({ _id: event._id }, { $set: { eventPosition: 'COMPLETED' } });
                    completedCount++;
                } else if (now >= startDateTime && now <= endDateTime && event.eventPosition !== 'ONGOING') {
                    await Event.updateOne({ _id: event._id }, { $set: { eventPosition: 'ONGOING' } });
                    ongoingCount++;
                }
            }

            console.log(`Events updated - Completed: ${completedCount}, Ongoing: ${ongoingCount}`);
        } catch (error) {
            console.error('Event status cron error:', error);
        }
    });
};