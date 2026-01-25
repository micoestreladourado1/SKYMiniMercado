
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string;
    icon: 'currency' | 'chart' | 'receipt' | 'cart' | 'users' | 'breakage' | 'cancel';
    highlight?: boolean;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, highlight }) => {

    const renderIcon = () => {
        const iconClass = "w-6 h-6";
        const iconMap = {
            currency: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.553-.44 1.278-.659 2.003-.659s1.45.22 2.003.659c1.106.879 1.106 2.303 0 3.182s-1.106 1.639-2.003 1.639c-.725 0-1.45-.22-2.003-.659Z" /></svg>,
            chart: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h12M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-12a2.25 2.25 0 0 1-2.25-2.25V3.75m16.5 0v-1.5m0 1.5v16.5" /></svg>,
            receipt: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h5.25m-5.25 0h5.25m-5.25 0h5.25M3 4.5h15A2.25 2.25 0 0 1 20.25 6.75v10.5A2.25 2.25 0 0 1 18 19.5H3.75A2.25 2.25 0 0 1 1.5 17.25V6.75A2.25 2.25 0 0 1 3.75 4.5Z" /></svg>,
            cart: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c.51 0 .962-.343 1.087-.835l1.838-5.513a1.875 1.875 0 0 0-1.087-2.335H5.828M9 18.75m-1.5-1.5a1.5 1.5 0 1 0 3 0m-3 0a1.5 1.5 0 1 0 3 0m7.5-1.5m-1.5-1.5a1.5 1.5 0 1 0 3 0m-3 0a1.5 1.5 0 1 0 3 0M12 12.75h4.5m-4.5-3h4.5m-4.5-3h4.5M12 12.75h-4.5m4.5 3h-4.5m4.5 3h-4.5" /></svg>,
            users: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.928A9.083 9.083 0 0 1 12 3.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 6.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 9.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 12.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 15.75a9.083 9.083 0 0 1 5.25 1.905m-7.5 3.512A9.083 9.083 0 0 1 12 18.75a9.083 9.083 0 0 1 5.25 1.905m-10.5-9.252A9.083 9.083 0 0 1 3.75 12.75a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25M12 3.75a9.083 9.083 0 0 1-5.25 1.905m7.5 14.25a9.083 9.083 0 0 1-5.25 1.905m7.5-1.905a9.083 9.083 0 0 1-5.25 1.905m3.512-7.5a9.083 9.083 0 0 1-1.905 5.25m-3.512-7.5a9.083 9.083 0 0 1-1.905 5.25" /></svg>,
            breakage: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-1.5-1.5m0 0L17.25 9m1.5-3-1.5 1.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>,
            cancel: <svg xmlns="http://www.w3.org/2000/svg" className={iconClass} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        };
        return iconMap[icon] || null;
    }

    return (
        <div className={`relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] ${highlight
            ? 'bg-gradient-to-br from-cyan-600 via-cyan-700 to-indigo-900 border-cyan-400/30'
            : 'bg-gray-900/40 border-gray-800/50 hover:border-gray-700/80 backdrop-blur-md'
            } border rounded-2xl p-5 flex flex-col h-full shadow-2xl`}>

            {/* Background pattern */}
            <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="w-32 h-32 rounded-full bg-white blur-3xl"></div>
            </div>

            <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl ${highlight ? 'bg-white/10 text-white' : 'bg-gray-800/80 text-cyan-400'} shadow-lg`}>
                    {renderIcon()}
                </div>
                {highlight && (
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/10 text-white px-2 py-1 rounded-md">Principal</span>
                )}
            </div>

            <div className="mt-6">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${highlight ? 'text-cyan-100/70' : 'text-gray-500'}`}>{title}</h3>
                <p className={`text-2xl font-black mt-1 tracking-tight ${highlight ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400'}`}>
                    {value}
                </p>
            </div>

            {/* Subtle glow effect */}
            <div className={`absolute bottom-0 left-0 w-full h-1 opacity-20 ${highlight ? 'bg-white' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)]'}`}></div>
        </div>
    );
};

export default KpiCard;
