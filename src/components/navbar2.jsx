{
    navItems.map((item) => (



        <Link
            key={item.id}
            to={item.link}
            className={`flex items-center gap-2 ${item.disabled ? 'opacity-30 cursor-not-allowed' : ''
                }`}
            onClick={(e) => {
                if (item.disabled) {
                    e.preventDefault();
                    alert('Completa lo step precedente per accedere a questa sezione.');
                }
            }}
        >


            <img
                src={currentPage === item.id ? item.iconActive : item.icon}
                alt={`${item.label} Icon`}
                className="w-[19px] h-[19px]"
            />
            <span
                className={`${currentPage === item.id
                    ? 'font-medium text-[#1d2125]'
                    : 'text-[#1d2125]'
                    }`}
            >
                {item.label}
            </span>
        </Link>
    ))
}