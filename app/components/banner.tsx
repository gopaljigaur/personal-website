import Image from "next/image";

export function Banner(props) {
    return (
        <span className="inline-flex mb-16">
            <div className="w-[48px] relative self-center">
                <Image
                    alt='Gopalji Gaur'
                    height={48}
                    width={48}
                    priority={true}
                    src='https://www.gravatar.com/avatar/0d634a9edf65bcc4916888473f10b1e6?size=200'
                    className="rounded-full bg-gray-200 dark:bg-gray-800 dark:brightness-90 dark:saturate-[0.85] transition"
                />
            </div>
            <h1 className="mt-2.5 ml-5 text-2xl font-semibold relative tracking-tight">
                <span className="mr-5">/</span>
                {props.children}
            </h1>
        </span>
    );
};